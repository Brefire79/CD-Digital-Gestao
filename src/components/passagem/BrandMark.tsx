export function BrandMark({ size = 44, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/brasao-cbmsp.png"
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      alt="Brasão do Corpo de Bombeiros da Polícia Militar do Estado de São Paulo"
    />
  );
}
