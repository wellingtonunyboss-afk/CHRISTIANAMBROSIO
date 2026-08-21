"use client";

import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Database,
  Layout,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Phone,
  Sparkles,
  Target,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AppearText from "./components/AppearText";
import PixelLedDisplay from "./components/PixelLedDisplay";
import ScrollWaveField from "./components/ScrollWaveField";

const generalWhatsApp =
  "https://wa.me/5545999336782?text=Ol%C3%A1%2C%20Christian!%20Acessei%20seu%20site%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto%20digital%20para%20minha%20empresa.";

const navItems = [
  { label: "Soluções", href: "#solucoes" },
  { label: "Método", href: "#metodo" },
  { label: "Experiência", href: "#experiencia" },
  { label: "Sobre", href: "#sobre" },
  { label: "Investimento", href: "#investimento" },
];

const rotatingTerms = ["sites profissionais", "sistemas sob medida", "IA aplicada", "automação comercial"];

const ledItems = [
  "5 anos com tecnologia",
  "sites profissionais",
  "sistemas personalizados",
  "automação e IA",
  "Cascavel e região",
];

const problems = [
  {
    icon: MonitorSmartphone,
    title: "Presença digital que não convence",
    text: "Uma página fraca reduz confiança, enfraquece campanhas e faz bons clientes desistirem antes do contato.",
  },
  {
    icon: Workflow,
    title: "Processos manuais demais",
    text: "Planilhas, retrabalho e tarefas repetitivas travam a operação quando a empresa começa a crescer.",
  },
  {
    icon: MessageCircle,
    title: "Atendimento sem escala",
    text: "Leads chegam por canais diferentes e se perdem quando não existe fluxo, triagem e acompanhamento.",
  },
];

const services = [
  {
    icon: Target,
    title: "Landing Page de Conversão",
    price: "A partir de R$ 500",
    cta: "Quero uma landing page",
    url: "https://wa.me/5545999336782?text=Ol%C3%A1%2C%20Christian!%20Vi%20o%20servi%C3%A7o%20de%20Landing%20Page%20e%20gostaria%20de%20entender%20como%20ele%20pode%20ajudar%20minha%20empresa.",
    text: "Para campanhas, serviços específicos e captação de contatos com uma mensagem direta.",
    benefits: ["Oferta clara", "Copy estratégica", "WhatsApp e formulário", "SEO estrutural básico"],
  },
  {
    icon: Layout,
    title: "Site Institucional Profissional",
    price: "A partir de R$ 1.000",
    cta: "Quero um site profissional",
    url: "https://wa.me/5545999336782?text=Ol%C3%A1%2C%20Christian!%20Vi%20o%20servi%C3%A7o%20de%20Site%20Institucional%20e%20gostaria%20de%20solicitar%20uma%20an%C3%A1lise%20para%20minha%20empresa.",
    text: "Para empresas que precisam apresentar autoridade, serviços e canais de contato com credibilidade.",
    benefits: ["Design personalizado", "Páginas institucionais", "Responsivo", "Preparado para expansão"],
  },
  {
    icon: Database,
    title: "Sistema Personalizado",
    price: "A partir de R$ 2.000",
    cta: "Quero analisar meu sistema",
    url: "https://wa.me/5545999336782?text=Ol%C3%A1%2C%20Christian!%20Tenho%20interesse%20em%20um%20Sistema%20Personalizado%20e%20gostaria%20de%20conversar%20sobre%20a%20necessidade%20da%20minha%20empresa.",
    text: "Para organizar dados, criar painéis, controlar fluxos internos e reduzir trabalho manual.",
    benefits: ["Login e permissões", "Dashboards", "Relatórios", "Integrações conforme escopo"],
  },
  {
    icon: Bot,
    title: "Agente de Inteligência Artificial",
    price: "A partir de R$ 1.500",
    cta: "Quero automatizar atendimento",
    url: "https://wa.me/5545999336782?text=Ol%C3%A1%2C%20Christian!%20Vi%20a%20solu%C3%A7%C3%A3o%20de%20Agentes%20de%20IA%20e%20gostaria%20de%20entender%20como%20automatizar%20o%20atendimento%2C%20as%20pr%C3%A9-vendas%20ou%20o%20follow-up%20da%20minha%20empresa.",
    text: "Para atender, qualificar, responder dúvidas e encaminhar oportunidades com regras claras.",
    benefits: ["Recepção virtual", "Pré-vendas", "Follow-up", "WhatsApp, site ou Instagram"],
  },
];

const method = [
  ["Diagnóstico", "Entendo o momento da empresa, o público, o processo comercial e os gargalos reais."],
  ["Estratégia", "Defino a solução, a mensagem, a arquitetura e os pontos de conversão antes do visual."],
  ["Design e construção", "Crio uma experiência com estética forte, responsiva, funcional e alinhada ao objetivo."],
  ["Entrega e evolução", "Publico, oriento o uso e deixo o projeto pronto para crescer com novas etapas."],
];

const cases = [
  "Agentes de IA para atendimento comercial, triagem e qualificação de oportunidades.",
  "Sistemas internos e dashboards para transformar rotinas dispersas em fluxos digitais.",
  "Landing pages e sites para empresas de diferentes segmentos com foco em apresentação profissional.",
  "Ferramentas personalizadas para controle financeiro, cadastros, relatórios e operação.",
];

const comparison = [
  ["Landing Page", "Converter uma oferta", "Campanhas e captação", "A partir de R$ 500"],
  ["Site Institucional", "Construir autoridade", "Empresas e serviços", "A partir de R$ 1.000"],
  ["Sistema", "Organizar operação", "Processos internos", "A partir de R$ 2.000"],
  ["Agente de IA", "Automatizar atendimento", "Pré-vendas e suporte", "A partir de R$ 1.500"],
];

const faqs = [
  ["Como saber qual solução escolher?", "Começamos com diagnóstico. Primeiro entendemos objetivo, público e problema. Depois definimos se o melhor caminho é landing page, site, sistema, agente de IA ou uma combinação."],
  ["Os valores são fechados?", "Não. Eles indicam investimento inicial. O valor final depende do escopo, número de páginas, funcionalidades, integrações e nível de personalização."],
  ["Existe mensalidade obrigatória?", "Não há mensalidade obrigatória pelo desenvolvimento. Suporte, manutenção, hospedagem, domínio, APIs e consumo de IA podem ter custos separados quando necessários."],
  ["O projeto fica pronto para evoluir?", "Sim. A estrutura é pensada para permitir novas páginas, módulos, integrações, automações e melhorias conforme a empresa avança."],
];

function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`gold-frame ${className}`}>
      <div className="gold-frame-content">{children}</div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTerm, setActiveTerm] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const year = new Date().getFullYear();
  const assetBase = import.meta.env?.BASE_URL ?? "/";

  useEffect(() => {
    let headerIsCompact = false;
    let frame = 0;
    const updateScrollState = () => {
      frame = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progressRef.current?.style.setProperty("transform", `scaleX(${window.scrollY / max})`);
      const nextHeaderState = window.scrollY > 24;
      if (nextHeaderState !== headerIsCompact) {
        headerIsCompact = nextHeaderState;
        setScrolled(nextHeaderState);
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollState);
    };
    updateScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTerm((value) => (value + 1) % rotatingTerms.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-locked", menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.16 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          name: "Christian Ambrosio",
          jobTitle: "Especialista em soluções digitais personalizadas",
          telephone: "+55 45 99933-6782",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Cascavel",
            addressRegion: "PR",
            addressCountry: "BR",
          },
          knowsAbout: [
            "Criação de sites em Cascavel",
            "Landing pages",
            "Desenvolvimento de sistemas",
            "Automação de atendimento",
            "Agentes de IA para empresas",
          ],
        },
        {
          "@type": "ProfessionalService",
          name: "Christian Ambrosio Digital Solutions",
          areaServed: "Cascavel-PR e região",
          telephone: "+55 45 99933-6782",
          priceRange: "A partir de R$ 500",
          serviceType: ["Landing pages", "Sites institucionais", "Sistemas personalizados", "Agentes de inteligência artificial"],
        },
      ],
    }),
    [],
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ScrollWaveField className="global-wave" />
      <div className="scroll-progress" ref={progressRef} />

      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a className="brand" href="#top" aria-label="Christian Ambrosio - início">
          <strong>Christian Ambrosio</strong>
          <small>Digital Solutions</small>
        </a>
        <button
          className="mobile-toggle"
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav id="main-nav" className={menuOpen ? "is-open" : ""} aria-label="Navegação principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a className="nav-cta" href={generalWhatsApp} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            Conversar
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow">Sites, sistemas e IA para empresas</p>
            <h1>
              Christian
              <span>Ambrosio</span>
            </h1>
            <p className="hero-lead">
              Desenvolvimento digital personalizado para empresas que querem transformar presença,
              atendimento e processos em crescimento real.
            </p>
            <div className="term-switch" aria-live="polite">
              <Sparkles size={18} />
              <span>{rotatingTerms[activeTerm]}</span>
            </div>
            <div className="hero-actions">
              <a className="button primary" href={generalWhatsApp} target="_blank" rel="noreferrer">
                Quero desenvolver meu projeto
                <ArrowRight size={19} />
              </a>
              <a className="button secondary" href="#solucoes">
                Conhecer soluções
              </a>
            </div>
          </div>

          <div className="hero-portrait" data-reveal>
            <div className="portrait-orbit orbit-a" />
            <div className="portrait-orbit orbit-b" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${assetBase}christian-ambrosio-hero.png`}
              alt="Christian Ambrosio, especialista em soluções digitais personalizadas"
              fetchPriority="high"
              width="1254"
              height="1254"
            />
          </div>
        </section>

        <section className="led-band" aria-label="Indicadores">
          <PixelLedDisplay items={ledItems} separator="-" speed={9} textSize={128} dotSize={16} spread={2} />
        </section>

        <section className="appear-section" aria-label="Mensagem principal">
          <AppearText text="TECNOLOGIA QUE TRABALHA PELO NEGÓCIO" className="appear-text" />
        </section>

        <section className="problem section-pad">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">Diagnóstico digital</p>
            <h2>Seu negócio não precisa de uma página bonita. Precisa de uma estrutura que vende.</h2>
            <p>
              O objetivo é unir estratégia, visual profissional e tecnologia aplicada para que cada
              ponto de contato ajude a gerar confiança, organizar processos e acelerar decisões.
            </p>
          </div>
          <div className="problem-row">
            {problems.map(({ icon: Icon, title, text }) => (
              <article className="problem-item" key={title} data-reveal>
                <Icon size={26} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="solucoes" className="services section-pad">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">Soluções</p>
            <h2>Projetos digitais feitos para o momento da sua empresa</h2>
            <p>
              Cada solução parte de uma necessidade real: captar clientes, transmitir autoridade,
              organizar operação ou automatizar etapas do atendimento.
            </p>
          </div>
          <div className="service-grid">
            {services.map(({ icon: Icon, title, price, text, benefits, cta, url }) => (
              <Frame className="service-card" key={title}>
                <div className="service-top">
                  <span className="icon-ring">
                    <Icon size={28} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
                <ul>
                  {benefits.map((benefit) => (
                    <li key={benefit}>
                      <Check size={16} />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="service-bottom">
                  <strong>{price}</strong>
                  <a className="button service-button" href={url} target="_blank" rel="noreferrer">
                    {cta}
                  </a>
                </div>
              </Frame>
            ))}
          </div>
        </section>

        <section id="metodo" className="method section-pad">
          <div className="section-heading left" data-reveal>
            <p className="eyebrow">Método</p>
            <h2>Antes do código, vem clareza.</h2>
            <p>
              Um projeto profissional precisa parecer bonito, mas não pode nascer só da aparência.
              Primeiro definimos o que a solução precisa resolver.
            </p>
          </div>
          <div className="method-list">
            {method.map(([title, text], index) => (
              <article className="method-item" key={title} data-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="experiencia" className="experience section-pad">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">Experiência aplicada</p>
            <h2>Soluções para problemas reais de atendimento, venda e operação</h2>
          </div>
          <div className="case-strip">
            {cases.map((item) => (
              <p key={item} data-reveal>
                <Zap size={19} />
                {item}
              </p>
            ))}
          </div>
        </section>

        <section id="sobre" className="about section-pad">
          <div className="about-kicker" data-reveal>
            <p className="eyebrow">Sobre Christian Ambrosio</p>
            <h2>Estratégia, tecnologia e proximidade para tirar projetos do genérico.</h2>
          </div>
          <div className="about-editorial" data-reveal>
            <p>
              Atuo há cinco anos com tecnologia e desenvolvimento de soluções digitais. Nesse
              período, participei da criação de sites, landing pages, sistemas internos, dashboards,
              automações e agentes de inteligência artificial voltados para atendimento e vendas.
            </p>
            <p>
              Meu trabalho começa entendendo o problema. A partir disso, desenho uma solução com
              estética forte, estrutura clara e possibilidade de evolução. A entrega precisa ser
              bonita, mas também precisa funcionar dentro da realidade da empresa.
            </p>
          </div>
        </section>

        <section id="investimento" className="investment section-pad">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">Investimento</p>
            <h2>Escolha o caminho certo para começar</h2>
          </div>
          <div className="comparison-grid">
            {comparison.map(([solution, goal, ideal, price]) => (
              <article className="comparison-item" key={solution} data-reveal>
                <span>{solution}</span>
                <strong>{price}</strong>
                <p>{goal}</p>
                <small>{ideal}</small>
              </article>
            ))}
          </div>
          <p className="terms-note" data-reveal>
            Os valores indicam investimento inicial. Hospedagem, domínio, APIs, consumo de IA,
            manutenção, suporte e integrações podem ter custos separados quando fizerem parte do escopo.
          </p>
        </section>

        <section className="mid-cta">
          <div data-reveal>
            <p className="eyebrow">Orientação inicial</p>
            <h2>Não sabe qual solução sua empresa precisa?</h2>
            <p>Você não precisa chegar com tudo definido. Primeiro entendemos o problema. Depois encontramos o melhor caminho.</p>
          </div>
          <a className="button primary" href={generalWhatsApp} target="_blank" rel="noreferrer">
            Conversar com Christian
            <MessageCircle size={19} />
          </a>
        </section>

        <section className="faq section-pad" id="faq">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">FAQ</p>
            <h2>Perguntas frequentes</h2>
          </div>
          <div className="accordion">
            {faqs.map(([question, answer], index) => {
              const isOpen = openFaq === index;
              return (
                <article className="faq-item" key={question} data-reveal>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    id={`faq-button-${index}`}
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  >
                    <span>{question}</span>
                    <ChevronDown size={21} />
                  </button>
                  <div id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-button-${index}`} hidden={!isOpen}>
                    <p>{answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="final-cta section-pad">
          <p className="eyebrow">Vamos construir o próximo passo</p>
          <h2>Sua empresa não precisa se adaptar a uma solução genérica.</h2>
          <p>Vamos criar uma solução digital preparada para a realidade do seu negócio.</p>
          <a className="button primary" href={generalWhatsApp} target="_blank" rel="noreferrer">
            Falar sobre meu projeto
            <ArrowRight size={20} />
          </a>
          <span>Christian Ambrosio - Cascavel-PR e região.</span>
        </section>

        <section id="politica" className="legal section-pad">
          <h2>Política de Privacidade</h2>
          <p>
            As informações enviadas por canais de contato são utilizadas apenas para atendimento,
            diagnóstico comercial e retorno sobre projetos solicitados. Ferramentas, APIs e
            plataformas externas seguem suas próprias políticas.
          </p>
        </section>

        <section id="termos" className="legal section-pad">
          <h2>Termos de Uso</h2>
          <p>
            As informações desta página são comerciais e podem ser ajustadas conforme escopo,
            disponibilidade, tecnologias, serviços contratados e necessidades de cada projeto.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <a className="brand" href="#top" aria-label="Christian Ambrosio - início">
            <strong>Christian Ambrosio</strong>
            <small>Digital Solutions</small>
          </a>
          <p>Cascavel-PR e região</p>
          <a href="tel:+5545999336782">
            <Phone size={16} />
            WhatsApp: (45) 99933-6782
          </a>
        </div>
        <div className="footer-links">
          {[...navItems, { label: "FAQ", href: "#faq" }, { label: "Privacidade", href: "#politica" }, { label: "Termos", href: "#termos" }].map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
        <p className="copyright">© {year} Christian Ambrosio. Todos os direitos reservados.</p>
      </footer>

      <a className="whatsapp-float" href={generalWhatsApp} target="_blank" rel="noreferrer" aria-label="Falar com Christian Ambrosio pelo WhatsApp">
        <MessageCircle size={24} />
      </a>
    </>
  );
}
