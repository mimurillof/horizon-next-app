'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TourCard {
  id: number;
  title: string;
  content: string;
  image: string;
}

export default function WelcomeTourPage() {
  const router = useRouter();
  const [currentCard, setCurrentCard] = useState(0);

  const tourCards: TourCard[] = [
    {
      id: 1,
      title: "¡Bienvenido/a a tu centro de inversión inteligente!",
      content: "Nuestra misión es darte la confianza y las herramientas para que tomes mejores decisiones financieras, con el poder de la inteligencia artificial como tu copiloto. Para empezar, vamos a organizar tus inversiones actuales en lo que se conoce como un portafolio.\n\nPiensa en tu portafolio como una canasta donde guardas todos tus activos financieros (acciones, criptomonedas, fondos, etc.). Organizarlo nos permite ver el panorama completo, entender tu rendimiento y encontrar las mejores oportunidades para crecer.",
      image: "/image 1.png"
    },
    {
      id: 2,
      title: "Antes de invertir, definamos tu estrategia",
      content: "Para que nuestra IA te ofrezca recomendaciones realmente útiles para ti, primero necesitamos conocerte un poco mejor. En los siguientes pasos, te haremos algunas preguntas clave. No es un examen, ¡es el mapa que trazará tu ruta de inversión! Te preguntaremos sobre:\n\nTus Metas: ¿Para qué estás invirtiendo? (Comprar una casa, la jubilación, etc.).\n\nTu Horizonte: ¿Planeas usar este dinero pronto o en muchos años?\n\nTu Filosofía: ¿Prefieres ser un inversor paciente a largo plazo o gestionar tus activos de forma más activa?\n\nTu Comodidad con el Riesgo: ¿Cómo te sientes frente a las subidas y bajadas del mercado?",
      image: "/image 2.png"
    },
    {
      id: 3,
      title: "Ahora, registra tus activos actuales",
      content: `¡Es hora de construir tu portafolio en la app! En la siguiente pantalla, podrás añadir cada uno de los activos que ya posees.\n\nSigue estos pasos para registrar tus activos de forma sencilla y ordenada:\n\n1. Busca o escribe el nombre del activo (ejemplo: Bitcoin, Acción de Apple).\n2. Indica la fecha aproximada en que lo adquiriste.\n3. Ingresa el valor actual total que tienes de ese activo.\n\nNo te preocupes si no tienes los datos exactos, un estimado es perfecto para comenzar. ¡Vamos a ello!`,
      image: "/image 3.webp"
    }
  ];

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % tourCards.length);
  };

  const goToCard = (index: number) => {
    setCurrentCard(index);
  };

  const handleCreatePortfolio = () => {
    router.push('/portfolios/create');
  };

  return (
    <div className="glass-card w-full max-w-full sm:max-w-4xl p-2 sm:p-4 rounded-3xl shadow-2xl text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/icon.png" alt="Horizon Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          <h1 className="text-sm sm:text-lg font-medium tracking-wider">Horizon Investment Hub</h1>
        </div>
        {/* Botón de cerrar sesión eliminado */}
      </div>

      {/* Tour Cards Slider */}
      <div className="relative mb-2 sm:mb-4 flex-1 flex flex-col">
        <div className="overflow-hidden rounded-2xl flex-1">
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentCard * 100}%)` }}
          >
            {tourCards.map((card) => (
              <div key={card.id} className="w-full flex-shrink-0 bg-white/5 p-2 sm:p-4 min-h-[200px] sm:min-h-[300px] flex flex-col justify-center">
                {card.id === 3 ? (
                  // Tarjeta especial reorganizada: grid con texto a la izquierda e imagen a la derecha
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-4 items-center h-full">
                    {/* Contenido */}
                    <div className="space-y-1 sm:space-y-3 order-2 md:order-1">
                      <h2 className="text-xs sm:text-lg font-bold text-[#F3F3F3] leading-tight">
                        {card.title}
                      </h2>
                      <div className="text-gray-300 leading-relaxed space-y-1 sm:space-y-2">
                        {/* Introducción */}
                        <p className="text-xs sm:text-sm md:text-base">
                          {card.content.split('\n\n')[0]}
                        </p>
                        {/* Lista numerada */}
                        <ol className="list-decimal list-inside text-xs sm:text-sm md:text-base text-left space-y-1 pl-2">
                          <li>Busca o escribe el nombre del activo (ejemplo: Bitcoin, Acción de Apple).</li>
                          <li>Indica la fecha aproximada en que lo adquiriste.</li>
                          <li>Ingresa el valor actual total que tienes de ese activo.</li>
                        </ol>
                        {/* Nota final */}
                        <p className="text-xs sm:text-sm md:text-base">
                          {card.content.split('\n\n').slice(-1)[0]}
                        </p>
                      </div>
                    </div>
                    {/* Imagen */}
                    <div className="flex justify-center order-1 md:order-2">
                      <img 
                        src={card.image} 
                        alt={`Ilustración ${card.id}`}
                        className="w-full max-w-[120px] sm:max-w-xs md:max-w-sm h-auto object-contain rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  // ... Tarjetas normales ...
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-4 items-center h-full">
                    {/* Imagen */}
                    <div className="flex justify-center">
                      <img 
                        src={card.image} 
                        alt={`Ilustración ${card.id}`}
                        className="w-full max-w-[120px] sm:max-w-xs md:max-w-sm h-auto object-contain rounded-lg"
                      />
                    </div>
                    {/* Contenido */}
                    <div className="space-y-1 sm:space-y-3">
                      <h2 className="text-xs sm:text-lg font-bold text-[#F3F3F3] leading-tight">
                        {card.title}
                      </h2>
                      <div className="text-gray-300 leading-relaxed space-y-1 sm:space-y-2">
                        {card.content.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="text-xs sm:text-sm md:text-base">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Navigation Arrows eliminados, solo puntos */}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mb-2 sm:mb-4 space-x-2">
        {tourCards.map((_, index) => (
          <button
            key={index}
            onClick={() => goToCard(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentCard === index ? 'bg-[#B4B4B4]' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mb-2 sm:mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progreso del tour</span>
          <span>{currentCard + 1} de {tourCards.length}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div 
            className="bg-[#B4B4B4] h-1 rounded-full transition-all duration-500"
            style={{ width: `${((currentCard + 1) / tourCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {currentCard < tourCards.length - 1 ? (
          <>
            <button
              onClick={nextCard}
              className="flex justify-center items-center py-1 sm:py-2 px-2 sm:px-4 rounded-lg shadow-sm text-xs sm:text-sm font-semibold bg-[#B4B4B4] text-[#0A192F] hover:bg-[#B4B4B4] transition-all duration-300"
            >
              <span className="material-symbols-outlined mr-2">arrow_forward</span>
              Continuar Tour
            </button>
            <button
              onClick={handleCreatePortfolio}
              className="flex justify-center items-center py-1 sm:py-2 px-2 sm:px-4 rounded-lg shadow-sm text-xs sm:text-sm font-semibold border border-[#B4B4B4] text-[#B4B4B4] hover:bg-[#B4B4B4] hover:text-[#0A192F] transition-all duration-300"
            >
              <span className="material-symbols-outlined mr-2">skip_next</span>
              Saltar al Portafolio
            </button>
          </>
        ) : (
          <button
            onClick={handleCreatePortfolio}
            className="flex justify-center items-center py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm text-sm sm:text-md font-semibold bg-[#B4B4B4] text-[#0A192F] hover:bg-[#B4B4B4] transition-all duration-300"
          >
            <span className="material-symbols-outlined mr-2">trending_up</span>
            ¡Crear Mi Primer Portafolio!
          </button>
        )}
      </div>

      {/* Quick Access Link */}
      <div className="mt-2 sm:mt-4 text-center">
        <button
          onClick={handleCreatePortfolio}
          className="text-xs text-gray-400 hover:text-[#B4B4B4] transition-colors underline"
        >
          ¿Prefieres responder el cuestionario de perfil? (Requiere crear portafolio)
        </button>
      </div>
    </div>
  );
}