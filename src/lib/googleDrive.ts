const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface DriveFile {
  id: string;
  name: string;
  webViewLink?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: { type?: string }) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

export interface DriveLivroBackup {
  fileId: string;
  webViewLink: string;
  caminho: string;
  nomeArquivo: string;
}

let googleScriptPromise: Promise<void> | undefined;

function carregarGoogleIdentity(): Promise<void> {
  if (window.google?.accounts.oauth2) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existente = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    const script = existente ?? document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Não foi possível carregar a autenticação do Google. Verifique a conexão.'));
    if (!existente) document.head.appendChild(script);
  });

  return googleScriptPromise;
}

async function solicitarToken(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error('Backup não configurado. Informe VITE_GOOGLE_CLIENT_ID no ambiente do app.');
  }

  await carregarGoogleIdentity();
  if (!window.google?.accounts.oauth2) throw new Error('A autenticação do Google Drive não ficou disponível.');

  return new Promise((resolve, reject) => {
    const cliente = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new Error(response.error_description || response.error || 'Acesso ao Google Drive não autorizado.'));
      },
      error_callback: () => reject(new Error('A janela de autorização do Google Drive foi fechada ou bloqueada.'))
    });
    cliente.requestAccessToken({ prompt: '' });
  });
}

async function driveFetch<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers
    }
  });
  if (!response.ok) {
    const detalhe = await response.text();
    throw new Error(`Google Drive recusou o backup (${response.status}). ${detalhe.slice(0, 180)}`);
  }
  return response.json() as Promise<T>;
}

function escaparConsulta(valor: string): string {
  return valor.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function buscarArquivo(token: string, nome: string, parentId?: string, mimeType?: string): Promise<DriveFile | undefined> {
  const termos = [
    `name = '${escaparConsulta(nome)}'`,
    'trashed = false',
    parentId ? `'${escaparConsulta(parentId)}' in parents` : undefined,
    mimeType ? `mimeType = '${mimeType}'` : undefined
  ].filter(Boolean).join(' and ');
  const params = new URLSearchParams({ q: termos, fields: 'files(id,name,webViewLink)', pageSize: '10' });
  const resultado = await driveFetch<{ files: DriveFile[] }>(`https://www.googleapis.com/drive/v3/files?${params}`, token);
  return resultado.files[0];
}

async function obterOuCriarPasta(token: string, nome: string, parentId?: string): Promise<DriveFile> {
  const existente = await buscarArquivo(token, nome, parentId, FOLDER_MIME);
  if (existente) return existente;
  return driveFetch<DriveFile>('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nome, mimeType: FOLDER_MIME, ...(parentId ? { parents: [parentId] } : {}) })
  });
}

async function enviarPdf(
  token: string,
  pastaId: string,
  nomeArquivo: string,
  pdf: Uint8Array
): Promise<DriveFile> {
  const existente = await buscarArquivo(token, nomeArquivo, pastaId, 'application/pdf');
  const boundary = `cd-digital-${crypto.randomUUID()}`;
  const metadata = existente ? { name: nomeArquivo } : { name: nomeArquivo, parents: [pastaId] };
  const corpo = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`,
    pdf as BlobPart,
    `\r\n--${boundary}--`
  ]);
  const endpoint = existente
    ? `https://www.googleapis.com/upload/drive/v3/files/${existente.id}?uploadType=multipart&fields=id,name,webViewLink`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
  return driveFetch<DriveFile>(endpoint, token, {
    method: existente ? 'PATCH' : 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body: corpo
  });
}

export async function salvarLivroNoDrive(params: {
  prontidao: string;
  ano: number;
  nomeArquivo: string;
  pdf: Uint8Array;
}): Promise<DriveLivroBackup> {
  const token = await solicitarToken();
  const nomeProntidao = params.prontidao.trim().toLowerCase().startsWith('prontidão')
    ? params.prontidao.trim()
    : `Prontidão ${params.prontidao.trim()}`;
  const pastaProntidao = await obterOuCriarPasta(token, nomeProntidao);
  const pastaLivro = await obterOuCriarPasta(token, 'Livro dos Motoristas', pastaProntidao.id);
  const pastaAno = await obterOuCriarPasta(token, String(params.ano), pastaLivro.id);
  const arquivo = await enviarPdf(token, pastaAno.id, params.nomeArquivo, params.pdf);

  return {
    fileId: arquivo.id,
    webViewLink: arquivo.webViewLink || `https://drive.google.com/file/d/${arquivo.id}/view`,
    caminho: `${nomeProntidao}/Livro dos Motoristas/${params.ano}`,
    nomeArquivo: params.nomeArquivo
  };
}
