import React, { useState, useEffect } from 'react';
import { buildApiUrl, buildAssetUrl } from './backendConfig';

// --- TYPE DEFINITIONS ---
type Language = 'es' | 'en' | 'gl';
type Theme = 'light' | 'dark';
type View = 'sobre-mi' | 'works' | 'research' | 'portfolio' | 'contact';

interface NavItemProps {
  label: string;
  view: View;
  currentView: View | null;
  setView: (view: View) => void;
}

interface Image {
    src: string;
    alt: string;
}

interface PortfolioEvent {
    id: string;
    title: string;
    description: string;
    coverImage: Image;
    images: Image[];
    videos?: { src: string; alt: string }[];
    pdfs?: { src: string; alt: string }[];
}

// --- TRANSLATIONS ---
const translations = {
    es: {
        nav: { sobreMi: 'sobre mí', works: 'obras', research: 'investigación', portfolio: 'portfolio', contact: 'contacto' },
        sobreMi: {
            title: 'Sobre Mí',
            p1: 'Mi perfil combina la práctica académica, la experiencia artística y la innovación tecnológica aplicada a la enseñanza musical. Cuento con más de cuatro décadas de experiencia musical y una trayectoria consolidada de 26 años de docencia continua en el ámbito reglado del Conservatorio Profesional de Música Reveriano Soutullo de Ponteareas.',
            p2: 'Esta combinación única me permite ofrecer servicios educativos con profundidad teórica, contextualización cultural y experiencia práctica demostrada en diversos ámbitos. Desde mi participación como miembro fundador de Aerolíneas Federales en los años 80 —una de las bandas más relevantes de la escena musical gallega— hasta mi actual investigación doctoral en la UNED sobre música, identidad y migración, y mi trabajo con música algorítmica y live coding, he mantenido un compromiso constante con la innovación musical y la comprensión profunda del fenómeno musical como práctica social, artística y tecnológica.',
            p3: 'En la actualidad continúo con mi dedicación docente en el Conservatorio, combinándola con conciertos de mi proyecto de música por computadora Live Coding y la composición de obras que integran la música algorítmica coa tradición académica. Además, imparto talleres de SuperCollider y música algorítmica, orientados a la exploración de nuevas formas de creación sonora.',
            p4: 'En 2022 colaboré con el capítulo "A escena musical da Galicia Posmoderna" dentro del libro 40 anos da MODA en Vigo, publicado por Guiverny, donde analizo las transformaciónes culturales de Vigo y sus escenas musicales. Actualmente desarrollo el libro La Ciudad Eléctrica, un proyecto que cartografía los espacios, memorias y tensiones de la música urbana gallega.',
            formacionTitle: 'Formación Académica',
            formacionItems: [
                'Años 80: Profesor Superior en Música, Especialidad en Guitarra Clásica.',
                'Años 90-2000: Licenciado en Historia y CC de la Música (Universidad de la Rioja y Universitat de Barcelona).',
                'Años 2000: Diploma en Estudios Avanzados, certificando capacidad investigadora.',
                'Actualidad: Doctorando en Sociología (UNED). Tesis: "Cantando en tierra ajena: relatos musicales de la Galicia migrante".'
            ],
            trayectoriaTitle: 'Trayectoria Musical',
            trayectoriaBarTitle: 'Bar (1982)',
            trayectoriaBarP: 'Mi carrera comenzó con el grupo Bar, antecedente de Aerolíneas Federales. Como guitarrista y compositor, contribuí a su álbum homónimo, un referente del pop-rock y la nueva ola de la Movida Viguesa.',
            trayectoriaAaffTitle: 'Aerolíneas Federales (1981-1992, Reunión 2011-2016)',
            trayectoriaAaffP: 'Cofundador, bajista y vocalista de una de las bandas más emblemáticas de la movida gallega, con un estilo que combinaba melodías pop con actitud punk.',
            trayectoriaFelizTitle: 'Los Feliz (1994-2002)',
            trayectoriaFelizP: 'Tras Aerolíneas Federales, colaboré con Miguel Costas como guitarrista en el álbum "Aleluya" (1997), junto a músicos como Germán Coppini y Enrique Sierra.',
            versatilidadTitle: 'Versatilidad Musical y Tecnológica',
            versatilidadP: 'Mi especialización abarca desde la guitarra clásica y el bajo eléctrico hasta la programación aplicada a la música algorítmica y el live coding. Realizo una labor pionera en la captura y manipulación de paisajes sonoros de Galicia, utilizando estas grabaciones como material primario en composiciones y proyectos de live coding.',
            docenciaTitle: 'Experiencia Docente',
            docenciaP1: 'Conservatorio Profesional de Música Reveriano Soutullo (26 años de servicio)',
            docenciaP2: 'Imparto materias como Historia de la Música, Musicología, Nuevas Tecnologías, Guitarra Clásica y Eléctrica, integrando el estudio histórico con la práctica instrumental y el pensamiento crítico.',
            docenciaProyectosTitle: 'Proyectos y Desarrollo Tecnológico',
            docenciaProyectosP: 'Combino la docencia coa creación de herramientas digitales para la enseñanza musical, como una plataforma de gestión para centros musicales y aplicaciones web interactivas.',
            investigacionTitle: 'Investigación Académica',
            investigacionP: 'Mi investigación en la UNED se centra en la relación entre música, identidad y migración. Analizo cómo las prácticas musicales articulan pertenencias y memorias en contextos migratorios, con un enfoque en la diáspora gallega y los colectivos migrantes en Galicia.',
            influenciasTitle: 'Influencias y Preferencias Musicales',
            influenciasP: 'Mis gustos se mueven entre las músicas populares urbanas contemporáneas y la experimentación sonora. Me inspiran las escenas que combinan energía punk, sensibilidad pop y exploraciones de la música electrónica, así como las tradiciones de la vanguardia europea y americana.',
            presenciaTitle: 'Presencia Digital y Recursos',
        },
        works: {
            title: 'Obras Seleccionadas',
            work1Title: 'Acoustic Palimpsest (2023)',
            work1Desc: 'Instalación para 8 altavoces y grabaciones de campo procesadas.',
            work1P: 'Un paisaje sonoro inmersivo construido a partir de capas de entornos urbanos y naturales, manipulados digitalmente para revelar historias sónicas ocultas. La obra invita a los oyentes a navegar por un espacio definido por la memoria y la decadencia auditiva.',
            work2Title: 'Tension & Release (2021)',
            work2Desc: 'Performance en vivo para piano preparado y electrónica en tiempo real.',
            work2P: 'Una exploración dinámica del timbre acústico y electrónico, donde la resonancia física del piano se extiende y transforma mediante síntesis granular y procesamiento espectral, creando un diálogo entre o tangible y lo virtual.',
            work3Title: 'Sine Fields (2019)',
            work3Desc: 'Composición generativa para osciladores de ondas sinusoidales.',
            work3P: 'Una pieza minimalista que utiliza tonos puros para esculpir fenómenos psicoacústicos. La composición evoluciona lentamente según principios algorítmicos, explorando cambios sutiles en la armonía, la disonancia y la percepción espacial.',
        },
        research: {
            title: 'Investigación y Publicaciones',
            pub1Title: 'The Phenomenology of Digital Audio Artifacts',
            pub1Desc: 'Journal of Sonic Studies, Vol. 18 (2022)',
            pub1P: 'Una investigación sobre el potencial estético del "glitch" y el error digital, abogando por su consideración como material expresivo legítimo en la composición musical contemporánea.',
            pub2Title: 'Pedagogical Approaches to Live Electronics in Conservatory Training',
            pub2Desc: 'Proceedings of the International Conference on Music Education (2020)',
            pub2P: 'Este artículo describe un plan de estudios para integrar el procesamiento de audio en tiempo real y las tecnologías interactivas en la pedagogía de la música clásica.',
            pub3Title: 'Algorithmic Composition and Acoustic Ecology',
            pub3Desc: 'Organised Sound, Cambridge University Press (2018)',
            pub3P: 'Examina el uso de datos ambientales como fuente para sistemas de música generativa, proponiendo un modelo para composiciones que reflejen procesos ecológicos.',
        },
        portfolio: {
            title: 'Portfolio',
            modalClose: 'Cerrar'
        },
        contact: {
            title: 'Contacto',
            p1: 'Para consultas, colaboraciones o encargos, no dudes en ponerte en contacto.',
            email: 'Email:',
            presence: 'Presencia Digital:',
        },
        footer: '© {year} Silvino Díaz Carreras'
    },
    // ... (las otras traducciones 'en' y 'gl' van aquí, las omito por brevedad) ...
    en: {
        nav: { sobreMi: 'about me', works: 'works', research: 'research', portfolio: 'portfolio', contact: 'contact' },
        sobreMi: {
            title: 'About Me',
            p1: 'My profile combines academic practice, artistic experience, and technological innovation applied to music education. I have over four decades of musical experience and a consolidated track record of 26 continuous years of teaching in the official setting of the Reveriano Soutullo Professional Music Conservatory in Ponteareas.',
            p2: 'This unique combination allows me to offer educational services with theoretical depth, cultural contextualization, and proven practical experience in various fields. From my participation as a founding member of Aerolíneas Federales in the 80s—one of the most relevant bands of the Galician music scene—to my current doctoral research at UNED on music, identity, and migration, and my work with algorithmic music and live coding, I have maintained a constant commitment to musical innovation and a deep understanding of the musical phenomenon as a social, artistic, and technological practice.',
            p3: 'Currently, I continue my teaching dedication at the Conservatory, combining it with concerts of my computer music project Live Coding and the composition of works that integrate algorithmic music with academic tradition. Additionally, I conduct workshops on SuperCollider and algorithmic music, aimed at exploring new forms of sound creation.',
            p4: 'In 2022, I collaborated on the chapter "A escena musical da Galicia Posmoderna" in the book 40 anos da MODA en Vigo, published by Guiverny, where I analyze the cultural transformations of Vigo and its music scenes. I am currently developing the book La Ciudad Eléctrica, a project that maps the spaces, memories, and tensions of Galician urban music.',
            formacionTitle: 'Academic Background',
            formacionItems: [
                '80s: Superior Professor of Music, Specializing in Classical Guitar.',
                '90s-2000s: Bachelor of Arts in History and Music Sciences (University of La Rioja and University of Barcelona).',
                '2000s: Diploma of Advanced Studies, certifying research capability.',
                'Present: PhD candidate in Sociology (UNED). Thesis: "Singing in a foreign land: musical stories of migrant Galicia".'
            ],
            trayectoriaTitle: 'Musical Career',
            trayectoriaBarTitle: 'Bar (1982)',
            trayectoriaBarP: 'My career began with the group Bar, a precursor to Aerolíneas Federales. As a guitarist and composer, I contributed to their self-titled album, a benchmark of pop-rock and the new wave of the Movida Viguesa.',
            trayectoriaAaffTitle: 'Aerolíneas Federales (1981-1992, Reunion 2011-2016)',
            trayectoriaAaffP: 'Co-founder, bassist, and vocalist of one of the most emblematic bands of the Galician movida, with a style that combined pop melodies with a punk attitude.',
            trayectoriaFelizTitle: 'Los Feliz (1994-2002)',
            trayectoriaFelizP: 'After Aerolíneas Federales, I collaborated with Miguel Costas as a guitarist on the album "Aleluya" (1997), alongside musicians like Germán Coppini and Enrique Sierra.',
            versatilidadTitle: 'Musical and Technological Versatility',
            versatilidadP: 'My expertise ranges from classical guitar and electric bass to programming applied to algorithmic music and live coding. I pioneer the capture and manipulation of Galician soundscapes, using these recordings as primary material in compositions and live coding projects.',
            docenciaTitle: 'Teaching Experience',
            docenciaP1: 'Reveriano Soutullo Professional Music Conservatory (26 years of service)',
            docenciaP2: 'I teach subjects such as Music History, Musicology, New Technologies, Classical Guitar, and Electric Guitar, integrating historical study with instrumental practice and critical thinking.',
            docenciaProyectosTitle: 'Projects and Technological Development',
            docenciaProyectosP: 'I combine teaching with the creation of digital tools for music education, such as a management platform for music centers and interactive web applications.',
            investigacionTitle: 'Academic Research',
            investigacionP: 'My research at UNED focuses on the relationship between music, identity, and migration. I analyze how musical practices articulate belonging and memories in migratory contexts, with a focus on the Galician diaspora and migrant communities in Galicia.',
            influenciasTitle: 'Influences and Musical Preferences',
            influenciasP: 'My tastes range from contemporary urban popular music to sound experimentation. I am inspired by scenes that combine punk energy, pop sensibility, and explorations of electronic music, as well as the traditions of the European and American avant-garde.',
            presenciaTitle: 'Digital Presence and Resources',
        },
        works: {
            title: 'Selected Works',
            work1Title: 'Acoustic Palimpsest (2023)',
            work1Desc: 'Installation for 8 speakers and processed field recordings.',
            work1P: 'An immersive soundscape built from layers of urban and natural environments, digitally manipulated to reveal hidden sonic histories. The work invites listeners to navigate a space defined by memory and auditory decay.',
            work2Title: 'Tension & Release (2021)',
            work2Desc: 'Live performance for prepared piano and real-time electronics.',
            work2P: 'A dynamic exploration of acoustic and electronic timbre, where the physical resonance of the piano is extended and transformed through granular synthesis and spectral processing, creating a dialogue between the tangible and the virtual.',
            work3Title: 'Sine Fields (2019)',
            work3Desc: 'Generative composition for sine wave oscillators.',
            work3P: 'A minimalist piece that uses pure tones to sculpt psychoacoustic phenomena. The composition evolves slowly according to algorithmic principles, exploring subtle shifts in harmony, dissonance, and spatial perception.',
        },
        research: {
            title: 'Research & Publications',
            pub1Title: 'The Phenomenology of Digital Audio Artifacts',
            pub1Desc: 'Journal of Sonic Studies, Vol. 18 (2022)',
            pub1P: 'An inquiry into the aesthetic potential of "glitch" and digital error, arguing for their consideration as legitimate expressive material in contemporary music composition.',
            pub2Title: 'Pedagogical Approaches to Live Electronics in Conservatory Training',
            pub2Desc: 'Proceedings of the International Conference on Music Education (2020)',
            pub2P: 'This paper outlines a curriculum for integrating real-time audio processing and interactive technologies into classical music pedagogy.',
            pub3Title: 'Algorithmic Composition and Acoustic Ecology',
            pub3Desc: 'Organised Sound, Cambridge University Press (2018)',
            pub3P: 'Examines the use of environmental data as a source for generative music systems, proposing a model for compositions that reflect ecological processes.',
        },
        portfolio: {
            title: 'Portfolio',
            modalClose: 'Close'
        },
        contact: {
            title: 'Contact',
            p1: 'For inquiries, collaborations, or commissions, feel free to get in touch.',
            email: 'Email:',
            presence: 'Digital Presence:',
        },
        footer: '© {year} Silvino Díaz Carreras'
    },
    gl: {
        nav: { sobreMi: 'sobre min', works: 'obras', research: 'investigación', portfolio: 'portfolio', contact: 'contacto' },
        sobreMi: {
            title: 'Sobre Min',
            p1: 'O meu perfil combina a práctica académica, a experiencia artística e a innovación tecnolóxica aplicada á ensinanza musical. Conto con máis de catro décadas de experiencia musical e unha traxectoria consolidada de 26 anos de docencia continua no ámbito regrado do Conservatorio Profesional de Música Reveriano Soutullo de Ponteareas.',
            p2: 'Esta combinación única permíteme ofrecer servizos educativos con profundidade teórica, contextualización cultural e experiencia práctica demostrada en diversos ámbitos. Desde a miña participación como membro fundador de Aerolíneas Federales nos anos 80 —unha das bandas máis relevantes da escena musical galega— ata a miña actual investigación doutoral na UNED sobre música, identidade e migración, e o meu traballo con música algorítmica e live coding, mantiven un compromiso constante coa innovación musical e a comprensión profunda do fenómeno musical como práctica social, artística e tecnolóxica.',
            p3: 'Na actualidade continúo coa miña dedicación docente no Conservatorio, combinándoa con concertos do meu proxecto de música por computadora Live Coding e a composición de obras que integran a música algorítmica coa tradición académica. Ademais, imparto obradoiros de SuperCollider e música algorítmica, orientados á exploración de novas formas de creación sonora.',
            p4: 'En 2022 colaborei co capítulo "A escena musical da Galicia Posmoderna" dentro do libro 40 anos da MODA en Vigo, publicado por Guiverny, onde analizo as transformacións culturais de Vigo e as súas escenas musicais. Actualmente desenvolvo o libro La Ciudad Eléctrica, un proxecto que cartografía os espazos, memorias e tensións da música urbana galega.',
            formacionTitle: 'Formación Académica',
            formacionItems: [
                'Anos 80: Profesor Superior en Música, Especialidade en Guitarra Clásica.',
                'Anos 90-2000: Licenciado en Historia e CC da Música (Universidade da Rioxa e Universitat de Barcelona).',
                'Anos 2000: Diploma en Estudos Avanzados, certificando capacidade investigadora.',
                'Actualidade: Doutorando en Socioloxía (UNED). Tese: "Cantando en terra allea: relatos musicais da Galicia migrante".'
            ],
            trayectoriaTitle: 'Traxectoria Musical',
            trayectoriaBarTitle: 'Bar (1982)',
            trayectoriaBarP: 'A miña carreira comezou co grupo Bar, antecedente de Aerolíneas Federales. Como guitarrista e compositor, contribuín ao seu álbum homónimo, un referente do pop-rock e a nova onda da Movida Viguesa.',
            trayectoriaAaffTitle: 'Aerolíneas Federales (1981-1992, Reunión 2011-2016)',
            trayectoriaAaffP: 'Cofundador, baixista e vocalista dunha das bandas máis emblemáticas da movida galega, cun estilo que combinaba melodías pop con actitude punk.',
            trayectoriaFelizTitle: 'Los Feliz (1994-2002)',
            trayectoriaFelizP: 'Tras Aerolíneas Federales, colaborei con Miguel Costas como guitarrista no álbum "Aleluya" (1997), xunto a músicos como Germán Coppini e Enrique Sierra.',
            versatilidadTitle: 'Versatilidade Musical e Tecnolóxica',
            versatilidadP: 'A miña especialización abrangue desde a guitarra clásica e o baixo eléctrico ata a programación aplicada á música algorítmica e o live coding. Realizo un labor pioneiro na captura e manipulación de paisaxes sonoras de Galicia, utilizando estas gravacións como material primario en composicións e proxectos de live coding.',
            docenciaTitle: 'Experiencia Docente',
            docenciaP1: 'Conservatorio Profesional de Música Reveriano Soutullo (26 anos de servizo)',
            docenciaP2: 'Imparto materias como Historia da Música, Musicoloxía, Novas Tecnoloxías, Guitarra Clásica e Eléctrica, integrando o estudo histórico coa práctica instrumental e o pensamento crítico.',
            docenciaProyectosTitle: 'Proxectos e Desenvolvemento Tecnolóxico',
            docenciaProyectosP: 'Combino a docencia coa creación de ferramentas dixitais para a ensinanza musical, como unha plataforma de xestión para centros musicais e aplicacións web interactivas.',
            investigacionTitle: 'Investigación Académica',
            investigacionP: 'A miña investigación na UNED céntrase na relación entre música, identidade e migración. Analizo como as prácticas musicais articulan pertenzas e memorias en contextos migratorios, cun enfoque na diáspora galega e os colectivos migrantes en Galicia.',
            influenciasTitle: 'Influencias e Preferencias Musicais',
            influenciasP: 'Os meus gustos móvense entre as músicas populares urbanas contemporáneas e a experimentación sonora. Inspíranme as escenas que combinan enerxía punk, sensibilidade pop e exploracións da música electrónica, así como as tradicións da vangarda europea e americana.',
            presenciaTitle: 'Presenza Dixital e Recursos',
        },
        works: {
            title: 'Obras Seleccionadas',
            work1Title: 'Acoustic Palimpsest (2023)',
            work1Desc: 'Instalación para 8 altofalantes e gravacións de campo procesadas.',
            work1P: 'Unha paisaxe sonora inmersiva construída a partir de capas de contornos urbanos e naturais, manipulados dixitalmente para revelar historias sónicas ocultas. A obra convida aos oíntes a navegar por un espazo definido pola memoria e a decadencia auditiva.',
            work2Title: 'Tension & Release (2021)',
            work2Desc: 'Performance en vivo para piano preparado e electrónica en tempo real.',
            work2P: 'Unha exploración dinámica do timbre acústico e electrónico, onde a resonancia física do piano se estende e transforma mediante síntese granular e procesamento espectral, creando un diálogo entre o tanxible e o virtual.',
            work3Title: 'Sine Fields (2019)',
            work3Desc: 'Composición xerativa para osciladores de ondas sinusoidais.',
            work3P: 'Unha peza minimalista que utiliza tons puros para esculpir fenómenos psicoacústicos. A composición evoluciona lentamente segundo principios algorítmicos, explorando cambios sutís na harmonía, a disonancia e a percepción espacial.',
        },
        research: {
            title: 'Investigación e Publicacións',
            pub1Title: 'The Phenomenology of Digital Audio Artifacts',
            pub1Desc: 'Journal of Sonic Studies, Vol. 18 (2022)',
            pub1P: 'Unha investigación sobre o potencial estético do "glitch" e o erro dixital, defendendo a súa consideración como material expresivo lexítimo na composición musical contemporánea.',
            pub2Title: 'Pedagogical Approaches to Live Electronics in Conservatory Training',
            pub2Desc: 'Proceedings of the International Conference on Music Education (2020)',
            pub2P: 'Este artigo describe un plan de estudos para integrar o procesamento de son en tempo real e as tecnoloxías interactivas na pedagoxía da música clásica.',
            pub3Title: 'Algorithmic Composition and Acoustic Ecology',
            pub3Desc: 'Organised Sound, Cambridge University Press (2018)',
            pub3P: 'Examina o uso de datos ambientais como fonte para sistemas de música xerativa, propoñendo un modelo para composicións que reflictan procesos ecolóxicos.',
        },
        portfolio: {
            title: 'Portfolio',
            modalClose: 'Pechar'
        },
        contact: {
            title: 'Contacto',
            p1: 'Para consultas, colaboracións ou encargos, non dubides en poñerte en contacto.',
            email: 'Email:',
            presence: 'Presenza Dixital:',
        },
        footer: '© {year} Silvino Díaz Carreras'
    },
};

// --- SVG ICONS ---
const SunIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const Logo: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16" aria-label="TWISTIN Logo">
    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" className="fill-white dark:fill-gray-900" />
    <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1.5" />
    
    {/* Top Cross */}
    <line x1="44" y1="20" x2="56" y2="20" stroke="currentColor" strokeWidth="1.5" />
    <line x1="45" y1="15" x2="45" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <line x1="50" y1="15" x2="50" y2="25" stroke="currentColor" strokeWidth="1.5" />
    <line x1="55" y1="15" x2="55" y2="25" stroke="currentColor" strokeWidth="1.5" />

    {/* Bottom Cross */}
    <line x1="44" y1="80" x2="56" y2="80" stroke="currentColor" strokeWidth="1.5" />
    <line x1="45" y1="75" x2="45" y2="85" stroke="currentColor" strokeWidth="1.5" />
    <line x1="50" y1="75" x2="50" y2="85" stroke="currentColor" strokeWidth="1.5" />
    <line x1="55" y1="75" x2="55" y2="85" stroke="currentColor" strokeWidth="1.5" />

    {/* Horizontal Lines */}
    <line x1="30" y1="42" x2="70" y2="42" stroke="currentColor" strokeWidth="1.5" />
    <line x1="30" y1="58" x2="70" y2="58" stroke="currentColor" strokeWidth="1.5" />

    {/* Blue Waves */}
    <path d="M 25 35 C 40 28, 60 42, 75 35" stroke="#1e429f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M 25 65 C 40 72, 60 58, 75 65" stroke="#1e429f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    
    {/* Gold Dot */}
    <circle cx="50" cy="50" r="3.5" fill="#b45309" />
  </svg>
);


// --- NAVIGATION ITEM COMPONENT ---
const NavItem: React.FC<NavItemProps> = ({ label, view, currentView, setView }) => {
  const isActive = currentView === view;

  return (
    <li>
      <button
        onClick={() => setView(view)}
        className={`text-lg font-serif transition-all duration-200 lowercase px-4 py-1 ${
          isActive
            ? 'bg-brand-highlight text-black'
            : 'text-gray-500 dark:text-gray-400 hover:bg-brand-highlight hover:text-black'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {label}
      </button>
    </li>
  );
};

// --- CONTENT VIEW COMPONENTS ---
const SobreMi: React.FC<{ content: typeof translations.es.sobreMi }> = ({ content }) => (
    <div className="space-y-8 max-w-3xl text-lg leading-relaxed font-serif text-gray-800 dark:text-gray-300 animate-fade-in">
        <h3 className="text-4xl font-bold font-serif text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{content.title}</h3>
        
        <p>{content.p1}</p>
        <p>{content.p2}</p>
        <p>{content.p3}</p>
        <p>{content.p4}</p>

        <div className="my-6">
            <img src="https://placehold.co/800x500/1f2937/9ca3af?text=Silvino+D%C3%ADaz+Carreras" alt="Silvino Díaz Carreras tocando la guitarra" className="w-full rounded-md shadow-md"/>
        </div>
        
        <section className="space-y-4">
            <h4 className="text-2xl font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">{content.formacionTitle}</h4>
            <ul className="list-none space-y-3">
                {content.formacionItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        </section>

        <section className="space-y-4">
            <h4 className="text-2xl font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">{content.trayectoriaTitle}</h4>
            <div className="space-y-6">
                <div>
                    <h5 className="text-xl font-semibold">{content.trayectoriaBarTitle}</h5>
                    <p>{content.trayectoriaBarP}</p>
                </div>
                <div>
                    <h5 className="text-xl font-semibold">{content.trayectoriaAaffTitle}</h5>
                    <p>{content.trayectoriaAaffP}</p>
                </div>
                <div>
                    <h5 className="text-xl font-semibold">{content.trayectoriaFelizTitle}</h5>
                    <p>{content.trayectoriaFelizP}</p>
                </div>
            </div>
        </section>

        <section className="space-y-4">
            <h4 className="text-2xl font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">{content.versatilidadTitle}</h4>
            <p>{content.versatilidadP}</p>
             <div className="my-6">
                <img src="https://placehold.co/800x500/1f2937/9ca3af?text=Grabando+Soundscapes" alt="Silvino grabando soundscapes en paisaje costero de Galicia con equipo profesional" className="w-full rounded-md shadow-md"/>
            </div>
        </section>

        <section className="space-y-4">
            <h4 className="text-2xl font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">{content.docenciaTitle}</h4>
            <p><strong>{content.docenciaP1}</strong></p>
            <p>{content.docenciaP2}</p>
            <h5 className="text-xl font-semibold pt-2">{content.docenciaProyectosTitle}</h5>
            <p>{content.docenciaProyectosP}</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <img src="https://placehold.co/600x400/1f2937/9ca3af?text=Audici%C3%B3n+de+Guitarra" alt="Audición de guitarra con Silvino y estudiantes" className="w-full rounded-md shadow-md"/>
                <img src="https://placehold.co/600x400/1f2937/9ca3af?text=Recital+de+Estudiantes" alt="Silvino dirigiendo recital de estudiantes" className="w-full rounded-md shadow-md"/>
            </div>
        </section>

        <section className="space-y-4">
            <h4 className="text-2xl font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">{content.investigacionTitle}</h4>
            <p>{content.investigacionP}</p>
        </section>

        <section className="space-y-4">
            <h4 className="text-2xl font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">{content.influenciasTitle}</h4>
            <p>{content.influenciasP}</p>
        </section>
        
        <section className="space-y-4">
             <h4 className="text-2xl font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">{content.presenciaTitle}</h4>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <a href="https://www.researchgate.net/profile/Silvino-Diaz-Carreras" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">ResearchGate →</a>
                <a href="https://uned.academia.edu/SilvinoDiazCarreras" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Academia.edu →</a>
                <a href="https://open.spotify.com/artist/41azY3m2S8Zz9S0Irs5bA1" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Spotify →</a>
                <a href="https://vimeo.com/user12557618" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Vimeo →</a>
                <a href="https://sonentransito.blogspot.com/" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Blog →</a>
                <a href="https://github.com/twistin" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">GitHub →</a>
                <a href="https://linktr.ee/silvinodiazcarreras" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Linktree →</a>
             </div>
        </section>
    </div>
);

const Works: React.FC<{ content: typeof translations.es.works }> = ({ content }) => (
    <div className="space-y-10 max-w-2xl text-lg font-serif text-gray-800 dark:text-gray-300 animate-fade-in">
        <h3 className="text-4xl font-bold font-serif text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{content.title}</h3>
        <div className="space-y-8">
            <div>
                <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">{content.work1Title}</h4>
                <p className="text-gray-600 dark:text-gray-400 italic">{content.work1Desc}</p>
                <p className="mt-2 leading-relaxed">{content.work1P}</p>
            </div>
            <div>
                <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">{content.work2Title}</h4>
                <p className="text-gray-600 dark:text-gray-400 italic">{content.work2Desc}</p>
                <p className="mt-2 leading-relaxed">{content.work2P}</p>
            </div>
            <div>
                <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">{content.work3Title}</h4>
                <p className="text-gray-600 dark:text-gray-400 italic">{content.work3Desc}</p>
                <p className="mt-2 leading-relaxed">{content.work3P}</p>
            </div>
        </div>
    </div>
);

const Research: React.FC<{ content: typeof translations.es.research }> = ({ content }) => (
    <div className="space-y-10 max-w-2xl text-lg font-serif text-gray-800 dark:text-gray-300 animate-fade-in">
        <h3 className="text-4xl font-bold font-serif text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{content.title}</h3>
        <ul className="space-y-6 list-none">
            <li>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{content.pub1Title}</h4>
                <p className="text-gray-600 dark:text-gray-400 italic">{content.pub1Desc}</p>
                <p className="mt-1">{content.pub1P}</p>
            </li>
            <li>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{content.pub2Title}</h4>
                <p className="text-gray-600 dark:text-gray-400 italic">{content.pub2Desc}</p>
                <p className="mt-1">{content.pub2P}</p>
            </li>
            <li>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{content.pub3Title}</h4>
                <p className="text-gray-600 dark:text-gray-400 italic">{content.pub3Desc}</p>
                 <p className="mt-1">{content.pub3P}</p>
            </li>
        </ul>
    </div>
);

// --- Definición de props para Portfolio ---
interface PortfolioProps {
    title: string;
    onSelectEvent: (id: string) => void;
    events: PortfolioEvent[];
}

/**
 * Función auxiliar para construir la URL de un recurso.
 * Comprueba si la ruta ya es una URL absoluta (empieza con http).
 * Si no, le añade la URL del backend.
 */
function getImageUrl(src: string): string {
    return buildAssetUrl(src);
}

// --- Componente Portfolio ---
const Portfolio: React.FC<PortfolioProps> = ({ title, onSelectEvent, events }) => (
    <div className="space-y-10 max-w-5xl text-lg font-serif text-gray-800 dark:text-gray-300 animate-fade-in">
        <h3 className="text-4xl font-bold font-serif text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
                <div key={event.id} className="space-y-3 group cursor-pointer" onClick={() => onSelectEvent(event.id)}>
                    <div className="overflow-hidden rounded-md">
                        <img 
                            src={getImageUrl(event.coverImage.src)} 
                            alt={event.coverImage.alt} 
                            className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105 bg-gray-200 dark:bg-gray-700" // Añadido fondo mientras carga
                        />
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 italic">{event.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- Definición de props para PortfolioDetail ---
interface PortfolioDetailProps {
    event: PortfolioEvent;
    onClose: () => void;
    closeLabel: string;
}

// --- Componente PortfolioDetail ---
const PortfolioDetail: React.FC<PortfolioDetailProps> = ({ event, onClose, closeLabel }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Función para renderizar el contenido (imágenes, videos, PDFs)
    const renderMedia = (item: Image, index: number) => (
        <img 
            key={`img-${index}`} 
            src={getImageUrl(item.src)} 
            alt={item.alt} 
            className="w-full h-auto object-cover rounded-md" 
        />
    );

    const renderVideo = (item: Image, index: number) => (
        <video 
            key={`vid-${index}`}
            src={getImageUrl(item.src)} 
            controls 
            className="w-full h-auto rounded-md bg-black"
        >
            Tu navegador no soporta el tag de video.
        </video>
    );
    
    const renderPdf = (item: Image, index: number) => (
        <div key={`pdf-${index}`} className="p-4 border rounded-md text-center bg-gray-50 dark:bg-gray-800">
             <a 
                href={getImageUrl(item.src)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue hover:underline font-semibold"
            >
                Ver PDF: {item.alt || 'Documento'} ↗
            </a>
            <p className="text-sm text-gray-500 mt-2">Click para abrir en una nueva pestaña</p>
        </div>
    );

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-fast"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-modal-title"
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 m-4 max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                     <div className="flex-1">
                        <h3 id="portfolio-modal-title" className="text-3xl font-bold font-serif text-gray-900 dark:text-white">{event.title}</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                    </div>
                    <button onClick={onClose} className="text-4xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label={closeLabel}>
                        ×
                    </button>
                </div>
                {/* --- SECCIÓN DE MEDIA ACTUALIZADA --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Renderiza todas las imágenes */}
                    {event.images && event.images.map(renderMedia)}
                    
                    {/* Renderiza todos los videos */}
                    {event.videos && event.videos.map(renderVideo)}
                    
                    {/* Renderiza todos los PDFs */}
                    {event.pdfs && event.pdfs.map(renderPdf)}
                </div>
            </div>
        </div>
    );
};


const Contact: React.FC<{ content: typeof translations.es.contact }> = ({ content }) => (
    <div className="space-y-6 max-w-2xl text-lg font-serif text-gray-800 dark:text-gray-300 animate-fade-in">
        <h3 className="text-4xl font-bold font-serif text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{content.title}</h3>
        <p>{content.p1}</p>
        <div className="space-y-4 text-xl">
             <div>
                <strong className="block text-gray-900 dark:text-white">{content.email}</strong>
                <a href="mailto:info@silvinodiaz.com" className="text-brand-blue hover:underline">info@silvinodiaz.com</a>
            </div>
            <div>
                <strong className="block text-gray-900 dark:text-white">{content.presence}</strong>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                    <a href="https://github.com/twistin" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">GitHub →</a>
                    <a href="https://vimeo.com/user12557618" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Vimeo →</a>
                    <a href="https://linktr.ee/silvinodiazcarreras" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Linktree →</a>
                    <a href="https://www.researchgate.net/profile/Silvino-Diaz-Carreras" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">ResearchGate →</a>
                </div>
            </div>
        </div>
    </div>
);

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
    const [view, setView] = useState<View | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [language, setLanguage] = useState<Language>('es');
    const [theme, setTheme] = useState<Theme>('light');

    // --- Estado para eventos obtenidos del backend ---
    const [fetchedEvents, setFetchedEvents] = useState<PortfolioEvent[]>([]);

    // --- Cargar eventos al iniciar ---
    useEffect(() => {
        fetch(buildApiUrl('/events'))
            .then(res => res.json())
            .then(data => {
                setFetchedEvents(data.reverse()); // Pone los más nuevos primero
            })
            .catch(err => console.error("Error al cargar eventos:", err));
    }, []); // El array vacío asegura que se ejecute solo una vez

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (userPrefersDark) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const t = translations[language];
    
    // --- Usar 'fetchedEvents' para encontrar el evento seleccionado ---
    const selectedEvent = selectedEventId ? fetchedEvents.find(e => e.id === selectedEventId) : null;

    const renderView = () => {
        if (!view) return null;
        switch (view) {
            case 'sobre-mi': return <SobreMi content={t.sobreMi} />;
            case 'works': return <Works content={t.works} />;
            case 'research': return <Research content={t.research} />;
            
            case 'portfolio': return <Portfolio 
                                        title={t.portfolio.title} 
                                        onSelectEvent={setSelectedEventId}
                                        events={fetchedEvents}
                                    />;
            case 'contact': return <Contact content={t.contact} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans flex flex-col transition-colors duration-300">
            <style>{`
              @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
              .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
              .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
              .rgb-split-text { text-shadow: -2.5px 0px 0px rgba(255, 0, 60, 0.7), 2.5px 0px 0px rgba(0, 215, 255, 0.7); }
              .rgb-split-logo svg { filter: drop-shadow(-2.5px 0px 0px rgba(255, 0, 60, 0.7)) drop-shadow(2.5px 0px 0px rgba(0, 215, 255, 0.7)); }
            `}</style>

            <header className="w-full pt-8 pb-8 flex flex-col items-center justify-center gap-y-3 text-center">
                <div className="absolute top-4 right-4 flex items-center gap-4">
                     <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {(['es', 'en', 'gl'] as Language[]).map((lang, index) => (
                           <React.Fragment key={lang}>
                             {index > 0 && <span className="opacity-50">/</span>}
                             <button
                               onClick={() => setLanguage(lang)}
                               className={`transition-colors ${language === lang ? 'font-bold text-gray-900 dark:text-white' : 'hover:text-gray-900 dark:hover:text-white'}`}
                             >
                               {lang}
                             </button>
                           </React.Fragment>
                         ))}
                    </div>
                    <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Toggle theme">
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                </div>

                <nav className="mt-12">
                    <ul className="flex items-center divide-x divide-gray-300 dark:divide-gray-700">
                        <NavItem label={t.nav.sobreMi} view="sobre-mi" currentView={view} setView={setView} />
                        <NavItem label={t.nav.works} view="works" currentView={view} setView={setView} />
                        <NavItem label={t.nav.research} view="research" currentView={view} setView={setView} />
                        <NavItem label={t.nav.portfolio} view="portfolio" currentView={view} setView={setView} />
                        <NavItem label={t.nav.contact} view="contact" currentView={view} setView={setView} />
                    </ul>
                </nav>

                <div onClick={() => setView(null)} className="cursor-pointer mt-3" aria-label="Home" role="button">
                    <h1 className="text-xl font-sans tracking-wide text-gray-800 dark:text-gray-200 lowercase rgb-split-text">
                        Silvino Díaz Carreras
                    </h1>
                    <h2 className="text-lg text-gray-500 dark:text-gray-400 font-sans tracking-wider lowercase rgb-split-text">
                        twistin
                    </h2>
                </div>
                
                <div className="mt-4 cursor-pointer rgb-split-logo" onClick={() => setView(null)} aria-label="Home" role="button">
                    <Logo />
                </div>
            </header>

            <main key={view || 'empty'} className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12 lg:p-16">
                {renderView()}
            </main>
            
            {selectedEvent && <PortfolioDetail 
                                event={selectedEvent} 
                                onClose={() => setSelectedEventId(null)} 
                                closeLabel={t.portfolio.modalClose}
                            />}
            
            <footer className="text-center text-xs text-gray-400 dark:text-gray-500 py-4 mt-auto">
                <p>
                    {t.footer.replace('{year}', new Date().getFullYear().toString())}
                    <span style={{marginLeft: '1rem'}}>
                        <a href="/admin" style={{
                            color: '#bbb',
                            textDecoration: 'underline',
                            fontSize: '0.9em',
                            fontWeight: 400
                        }}>Admin</a>
                    </span>
                </p>
            </footer>
        </div>
    );
};

export default App;
