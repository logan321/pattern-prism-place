import { useState, useEffect } from 'react';
import { Menu, X, Play, MapPin, CheckCircle2, Cloud, Monitor, Shirt, LayoutPanelTop, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

// Temporary fallback for Link if not in a router context
const Link = ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>;


// Fallback Link component defined above

export default function HomePage() {
  console.log("HomePage component rendering");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-[#F26522]">MACRO MASTER</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/#simuladores" className="text-[#333333] font-medium hover:text-[#F26522] transition-colors">Simuladores</Link>
            <Link to="/#servicos" className="text-[#333333] font-medium hover:text-[#F26522] transition-colors">Serviços</Link>
            <Link to="/clientes" className="text-[#333333] font-medium hover:text-[#F26522] transition-colors">Clientes</Link>
            <Link to="/#contato" className="text-[#333333] font-medium hover:text-[#F26522] transition-colors">Contato</Link>
            <Link to="/simulador/futebol_masculino_3d">
              <Button className="bg-[#F26522] hover:bg-[#E55A00] text-white rounded-lg">
                Acessar Simulador
              </Button>
            </Link>
          </nav>

          <button className="md:hidden text-[#333333]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col space-y-6 text-xl">
              <Link to="/#simuladores" onClick={() => setIsMenuOpen(false)}>Simuladores</Link>
              <Link to="/#servicos" onClick={() => setIsMenuOpen(false)}>Serviços</Link>
              <Link to="/clientes" onClick={() => setIsMenuOpen(false)}>Clientes</Link>
              <Link to="/#contato" onClick={() => setIsMenuOpen(false)}>Contato</Link>
              <Link to="/simulador/futebol_masculino_3d">
                <Button className="bg-[#F26522] text-white py-6 w-full">
                  Acessar Simulador
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-b from-[#F8F9FA] to-white overflow-hidden">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold text-[#333333] mb-6 leading-tight">
              CONHEÇA A NOSSA SOLUÇÃO
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-[#666666] mb-10">
              Simule fácil e venda mais! Agilize a aprovação dos seus clientes com simulações profissionais!
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-[#F26522] hover:bg-[#E55A00] text-white h-14 px-8 rounded-lg flex items-center gap-2">
                <Play size={20} /> ASSISTA AO VÍDEO
              </Button>
              <Button variant="outline" className="border-[#F26522] text-[#F26522] h-14 px-8 rounded-lg flex items-center gap-2">
                <MapPin size={20} /> ENCONTRE O LOJISTA
              </Button>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-4 transform rotate-3">
              <img src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80" alt="Simulator Mockup" className="rounded-lg w-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simulator Cards */}
      <section id="simuladores" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Futebol Masculino 3D", desc: "Simule fácil e venda mais!", img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80", link: "/simulador/futebol_masculino_3d" },
              { title: "Agasalhos", desc: "Impressione equipes atléticas universitárias", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80", link: "#" },
              { title: "Brindes/Acessórios", desc: "Personalizações visualizadas, vendas facilitadas", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80", link: "#" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="group cursor-pointer"
              >
                <Card className="overflow-hidden border-none shadow-lg rounded-xl transition-shadow group-hover:shadow-2xl">
                  <div className="h-64 overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#333333] mb-2">{item.title}</h3>
                    <p className="text-[#666666] mb-6 text-sm">{item.desc}</p>
                    <Link to={item.link}>
                      <Button variant="outline" className="w-full border-[#F26522] text-[#F26522] group-hover:bg-[#F26522] group-hover:text-white transition-all">
                        ACESSAR SIMULADOR
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Cloud className="text-white" />, title: "Instalação do simulador", desc: "Implementação completa feita pela nossa equipe na nuvem" },
              { icon: <Monitor className="text-white" />, title: "Site Institucional", desc: "Site moderno para destacar seus produtos" },
              { icon: <Shirt className="text-white" />, title: "Estampas Vetorizadas", desc: "Centenas de estampas disponíveis em vetor" },
              { icon: <LayoutPanelTop className="text-white" />, title: "Painel Administrativo", desc: "Controle total das personalizações" }
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-sm rounded-xl p-6 bg-white">
                <div className="w-12 h-12 rounded-full bg-[#F26522] flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-[#333333] mb-4">{item.title}</h4>
                <p className="text-[#666666] text-sm leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">FORMULÁRIO DE CONTATO</h2>
          <p className="text-[#666666] mb-12">Preencha os dados abaixo. Em breve um de nossos atendentes irá entrar em contato.</p>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#333333]">Nome</label>
                <input className="w-full border border-[#E5E5E5] rounded-lg p-3 focus:ring-1 focus:ring-[#F26522] outline-none" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#333333]">Email</label>
                <input className="w-full border border-[#E5E5E5] rounded-lg p-3 focus:ring-1 focus:ring-[#F26522] outline-none" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#333333]">Telefone</label>
                <input className="w-full border border-[#E5E5E5] rounded-lg p-3 focus:ring-1 focus:ring-[#F26522] outline-none" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-[#333333] mb-2">Mensagem</label>
              <textarea className="flex-1 border border-[#E5E5E5] rounded-lg p-3 focus:ring-1 focus:ring-[#F26522] outline-none min-h-[150px]"></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button className="flex-1 bg-[#F26522] hover:bg-[#E55A00] text-white py-6 rounded-lg text-lg">
              Enviar
            </Button>
            <Button className="flex-1 bg-[#25D366] hover:bg-[#20bd5c] text-white py-6 rounded-lg text-lg flex items-center justify-center gap-2">
              <MessageSquare size={20} /> Chamar no WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8F9FA] pt-20 pb-10">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 border-b border-[#E5E5E5] pb-12">
          <div className="col-span-2">
            <span className="text-3xl font-bold text-[#F26522] block mb-6">MACRO MASTER</span>
            <p className="text-[#666666] max-w-md">Especialistas em simuladores 3D e soluções tecnológicas para empresas de confecção esportiva e brindes.</p>
          </div>
          <div>
            <h5 className="font-bold text-[#333333] mb-6">Links Rápidos</h5>
            <ul className="space-y-4 text-[#666666]">
              <li><Link to="/#simuladores" className="hover:text-[#F26522]">Simuladores</Link></li>
              <li><Link to="/#servicos" className="hover:text-[#F26522]">Serviços</Link></li>
              <li><Link to="/clientes" className="hover:text-[#F26522]">Clientes</Link></li>
              <li><Link to="/anuncios" className="hover:text-[#F26522]">Venda Mais</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-[#333333] mb-6">Redes Sociais</h5>
            <div className="flex space-x-4">
              <Link to="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#666666] hover:bg-[#F26522] hover:text-white transition-all"><MessageSquare size={20} /></Link>
              <Link to="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#666666] hover:bg-[#F26522] hover:text-white transition-all"><MessageSquare size={20} /></Link>
              <Link to="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#666666] hover:bg-[#F26522] hover:text-white transition-all"><MessageSquare size={20} /></Link>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-10 text-center text-[#999999] text-sm">
          <p>© 2026 MACRO MASTER - Simuladores Virtuais. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
