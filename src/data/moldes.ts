export interface Molde {
  id: string;
  nome: string;
  thumbnail: string;
}

export const moldes: Molde[] = [
  {
    id: "camisa-classica",
    nome: "Camisa Clássica",
    thumbnail:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 240'>
          <rect width='200' height='240' fill='#f5f5f5'/>
          <path d='M60 40 L100 20 L140 40 L180 70 L160 110 L140 95 L140 220 L60 220 L60 95 L40 110 L20 70 Z'
            fill='#ffffff' stroke='#cbd5e1' stroke-width='2'/>
        </svg>`,
      ),
  },
];