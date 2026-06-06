import { useState, useEffect } from 'react';

const Button = ({ children, style, className, ...props }: any) => (
  <button 
    className={className} 
    style={{ 
      cursor: 'pointer', 
      padding: '12px 24px',
      backgroundColor: '#F26522',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '14px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textTransform: 'uppercase',
      ...style 
    }} 
    {...props}
  >
    {children}
  </button>
);

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50, 
        padding: '20px', 
        backgroundColor: isScrolled ? 'white' : 'transparent', 
        borderBottom: isScrolled ? '1px solid #ddd' : 'none',
        transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#F26522' }}>MACRO MASTER</span>
          </div>

          <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="/#simuladores" style={{ color: '#333', textDecoration: 'none' }}>Simuladores</a>
            <a href="/#servicos" style={{ color: '#333', textDecoration: 'none' }}>Serviços</a>
            <a href="/clientes" style={{ color: '#333', textDecoration: 'none' }}>Clientes</a>
            <a href="/#contato" style={{ color: '#333', textDecoration: 'none' }}>Contato</a>
            <a href="/simulador/futebol_masculino_3d">
              <Button style={{ padding: '10px 20px' }}>
                Acessar Simulador
              </Button>
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ paddingTop: '150px', paddingBottom: '100px', background: 'linear-gradient(to bottom, #F8F9FA, white)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '50px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#333', marginBottom: '20px', lineHeight: 1.2 }}>
              CONHEÇA A NOSSA SOLUÇÃO
            </h1>
            <p style={{ fontSize: '20px', color: '#666', marginBottom: '40px' }}>
              Simule fácil e venda mais! Agilize a aprovação dos seus clientes com simulações profissionais!
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <Button style={{ fontSize: '16px' }}>
                ASSISTA AO VÍDEO
              </Button>
              <Button style={{ backgroundColor: 'transparent', color: '#F26522', border: '1px solid #F26522', fontSize: '16px' }}>
                ENCONTRE O LOJISTA
              </Button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
             <div style={{ background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', transform: 'rotate(3deg)' }}>
                <img src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80" alt="Simulator Mockup" style={{ borderRadius: '10px', width: '100%' }} />
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#F8F9FA', padding: '50px 20px', borderTop: '1px solid #E5E5E5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#F26522' }}>MACRO MASTER</span>
          <p style={{ color: '#666', marginTop: '20px' }}>© 2026 MACRO MASTER - Simuladores Virtuais. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
