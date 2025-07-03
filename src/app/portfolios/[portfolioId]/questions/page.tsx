'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Tipos para las respuestas
interface ProfileDateAnswer {
	profile: string;
	date?: string;
}

interface RiskOption {
	key: string;
	text: string;
	emoji: string;
	color: string;
	description: string;
}

type QuestionAnswer = string | ProfileDateAnswer;

const questions = [
	{
		id: 1,
		type: 'multiple_choice',
		question: '¿Para qué es este dinero?',
		subtitle:
			'Ej: Jubilación, comprar una casa, educación de hijos, crecimiento a largo plazo, generar ingresos pasivos. Esto es fundamental porque define la estrategia.',
		options: [
			'Jubilación',
			'Comprar una casa',
			'Educación de hijos',
			'Crecimiento a largo plazo',
			'Generar ingresos pasivos',
			'Otro', // Cambiado de "No sabe aún" a "Otro"
		],
	},
	{
		id: 2,
		type: 'profile_date',
		question: '¿Cuándo necesitará el dinero?',
		subtitle: 'Esto impacta directamente en el nivel de riesgo apropiado.',
		options: ['Trader (Corto Plazo)', 'Holder (Largo Plazo)'],
	},
	{
		id: 3,
		type: 'risk_tolerance',
		question: 'Imagina que invertiste un capital importante para ti ($10,000, por ejemplo), y debido a una situación inesperada en el mercado, tu inversión ha caído un 30% en un mes, es decir, ahora vale $7,000. Además, los expertos pronostican que la recuperación podría tardar más de un año.',
		subtitle: 'En este escenario, ¿cómo reaccionarías y qué harías?',
		options: [
			{
				key: 'A',
				text: 'Entraría en pánico, vendería inmediatamente y retiraría lo que quede para evitar más pérdidas. La seguridad de mi dinero es lo más importante.',
				emoji: 'warning',
				color: 'red',
				description: 'Aversión alta al riesgo'
			},
			{
				key: 'B',
				text: 'Me sentiría muy preocupado(a) y desilusionado(a). Seguiría de cerca las noticias y consideraría retirar una parte si la situación no mejora en los próximos meses.',
				emoji: 'help',
				color: 'orange',
				description: 'Aversión moderada al riesgo'
			},
			{
				key: 'C',
				text: 'Aunque no me gustaría ver la pérdida, entendería que es parte de invertir. Mantendría mi posición y esperaría la recuperación, quizás revisando si la estrategia inicial aún tiene sentido.',
				emoji: 'balance',
				color: 'yellow',
				description: 'Tolerancia moderada al riesgo'
			},
			{
				key: 'D',
				text: 'Lo vería como una oportunidad inmejorable para comprar más acciones o participaciones a un precio más bajo, si mis finanzas personales lo permiten. Confío en el rebote del mercado a largo plazo.',
				emoji: 'trending_up',
				color: 'green',
				description: 'Alta tolerancia al riesgo'
			}
		],
	},
	// Aquí se pueden agregar más preguntas
];

export default function QuestionsPage({ params }: { params: { portfolioId: string } }) {
	const { portfolioId } = params;
	const router = useRouter();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<number, QuestionAnswer>>({});

	const currentQuestion = questions[currentQuestionIndex];

	const handleAnswerChange = (questionId: number, value: QuestionAnswer) => {
		setAnswers((prev) => ({ ...prev, [questionId]: value }));
	};

	const handleNext = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else {
			// Navegar a la página de selección de activos después de la última pregunta
			console.log('Respuestas finales:', answers);
			router.push(`/portfolios/${portfolioId}`);
		}
	};

	const handleBack = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const isProfileDateAnswer = (answer: QuestionAnswer): answer is ProfileDateAnswer => {
		return typeof answer === 'object' && answer !== null && 'profile' in answer;
	};

	const getSelectedColorClasses = (color: string) => {
		const colorMap = {
			red: 'bg-red-500/20 border-red-500 text-red-100',
			orange: 'bg-orange-500/20 border-orange-500 text-orange-100',
			yellow: 'bg-yellow-500/20 border-yellow-500 text-yellow-100',
			green: 'bg-green-500/20 border-green-500 text-green-100',
		};
		return colorMap[color as keyof typeof colorMap] || 'bg-[#D4AF37] text-[#0A192F]';
	};

	const HOLDER_OPTION = 'Holder (Largo Plazo)';

	const isNextDisabled = () => {
		const currentAnswer = answers[currentQuestion.id];
		if (!currentAnswer) return true;

		if (currentQuestion.type === 'profile_date') {
			if (isProfileDateAnswer(currentAnswer) && (currentAnswer as ProfileDateAnswer).profile === HOLDER_OPTION && !(currentAnswer as ProfileDateAnswer).date) {
				return true;
			}
			if (!isProfileDateAnswer(currentAnswer) && currentAnswer !== 'Trader (Corto Plazo)') {
				return true;
			}
		}
		
		// Para todos los otros tipos de pregunta (incluyendo risk_tolerance), solo verificar que haya una respuesta
		return false;
	};

	return (
		<div className="glass-card w-full max-w-5xl p-8 rounded-3xl shadow-2xl text-white">
			{/* Encabezado */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<Link
						href="/portfolios"
						className="inline-flex items-center gap-2 text-sm font-light text-gray-400 hover:text-white transition-colors mb-2"
					>
						<span className="material-symbols-outlined text-sm">arrow_back</span>
						Volver al inicio
					</Link>
					<h1 className="text-4xl font-medium tracking-wider capitalize">
						Cuestionario para: {decodeURIComponent(portfolioId)}
					</h1>
					<p className="text-base text-gray-400 mt-2">
						Responde para definir tu estrategia de inversión.
					</p>
				</div>
				<div className="text-sm text-gray-400">
					Paso {currentQuestionIndex + 1} de {questions.length}
				</div>
			</div>

			{/* Tarjeta de Pregunta */}
			<motion.div 
				key={currentQuestion.id}
				initial={{ opacity: 0, x: 50 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: -50 }}
				transition={{ duration: 0.3 }}
				className="my-6"
			>
				<h2 className="text-2xl font-semibold mb-3">
					{currentQuestion.question}
				</h2>
				<p className="text-gray-400 mb-6 text-base">
					{currentQuestion.subtitle}
				</p>

				{currentQuestion.type === 'multiple_choice' && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{(currentQuestion.options as string[]).map((option) => (
							<button
								key={option}
								onClick={() => handleAnswerChange(currentQuestion.id, option)}
								className={`p-5 rounded-lg text-left transition-colors duration-200 ${
									answers[currentQuestion.id] === option
										? 'bg-[#D4AF37] text-[#0A192F]'
										: 'bg-white/5 hover:bg-white/10'
								}`}
							>
								<span className="font-semibold text-base">{option}</span>
							</button>
						))}
					</div>
				)}

				{currentQuestion.type === 'profile_date' && (
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{(currentQuestion.options as string[]).map((option) => (
								<button
									key={option}
									onClick={() => {
										if (option === 'Trader (Corto Plazo)') {
											handleAnswerChange(currentQuestion.id, option);
										} else {
											handleAnswerChange(currentQuestion.id, { profile: option });
										}
									}}
									className={`p-5 rounded-lg text-left transition-colors duration-200 ${
										(isProfileDateAnswer(answers[currentQuestion.id]) && (answers[currentQuestion.id] as ProfileDateAnswer).profile === option) || answers[currentQuestion.id] === option
											? 'bg-[#D4AF37] text-[#0A192F]'
											: 'bg-white/5 hover:bg-white/10'
									}`}
								>
									<span className="font-semibold text-base">{option.split('(')[0]}</span>
									<span className="block text-sm opacity-80">{option.split('(')[1]?.replace(')', '')}</span>
								</button>
							))}
						</div>

						{isProfileDateAnswer(answers[currentQuestion.id]) && (answers[currentQuestion.id] as ProfileDateAnswer).profile === HOLDER_OPTION && (
							<div className="p-4 bg-white/5 rounded-lg">
								<label htmlFor="future-date" className="block text-sm font-medium text-gray-300 mb-3">
									Establecer una fecha futura
								</label>
								<input
									id="future-date"
									type="date"
									min={new Date().toISOString().split('T')[0]}
									value={isProfileDateAnswer(answers[currentQuestion.id]) ? (answers[currentQuestion.id] as ProfileDateAnswer).date || '' : ''}
									onChange={(e) => {
										if (isProfileDateAnswer(answers[currentQuestion.id])) {
											handleAnswerChange(currentQuestion.id, { ...(answers[currentQuestion.id] as ProfileDateAnswer), date: e.target.value });
										}
									}}
									className="input-line w-full p-3 text-white bg-transparent border-b-[#D4AF37] text-base"
								/>
							</div>
						)}
					</div>
				)}

				{currentQuestion.type === 'risk_tolerance' && (
					<div className="space-y-4">
						{(currentQuestion.options as RiskOption[]).map((option, index) => (
							<motion.button
								key={option.key}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								whileHover={{ 
									scale: 1.02,
									transition: { duration: 0.2 }
								}}
								whileTap={{ scale: 0.98 }}
								onClick={() => handleAnswerChange(currentQuestion.id, option.key)}
								className={`relative p-6 rounded-xl text-left transition-all duration-300 ${
									answers[currentQuestion.id] === option.key
										? getSelectedColorClasses(option.color)
										: 'bg-white/5 hover:bg-white/10 border border-white/20'
								}`}
							>
								{answers[currentQuestion.id] === option.key && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ 
											opacity: [0, 0.6, 0.8, 0.6, 0.8],
											scale: [1, 1.01, 1, 1.005, 1]
										}}
										transition={{ 
											duration: option.color === 'red' ? 2.0 : 
													 option.color === 'orange' ? 2.5 : 
													 option.color === 'yellow' ? 3.0 : 
													 2.8,
											repeat: Infinity,
											repeatType: 'loop',
											ease: 'easeInOut'
										}}
										className={`absolute inset-0 rounded-xl ${
											option.color === 'red' ? 'bg-gradient-to-r from-red-500/10 via-red-400/5 to-red-500/10' :
											option.color === 'orange' ? 'bg-gradient-to-r from-orange-500/8 via-orange-300/4 to-orange-500/8' :
											option.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500/6 via-yellow-300/3 to-yellow-500/6' :
											'bg-gradient-to-r from-green-500/10 via-emerald-400/5 to-green-500/10'
										}`}
									/>
								)}
								<div className="relative flex items-center justify-between">
									<div className="flex items-center gap-4 flex-1">
										<motion.div 
											className={`text-3xl flex-shrink-0 ${
												answers[currentQuestion.id] === option.key ?
												(option.color === 'red' ? 'text-red-400' :
												 option.color === 'orange' ? 'text-orange-400' :
												 option.color === 'yellow' ? 'text-yellow-400' :
												 'text-green-400') : 'text-current'
											}`}
											animate={answers[currentQuestion.id] === option.key ? {
												scale: [1, 1.05, 1],
												rotate: option.color === 'red' ? [0, -2, 2, 0] :
														option.color === 'orange' ? [0, -1, 1, 0] :
														option.color === 'yellow' ? [0, -3, 3, 0] :
														[0, 2, -2, 0]
											} : {}}
											transition={{ 
												duration: 2.5,
												repeat: answers[currentQuestion.id] === option.key ? Infinity : 0,
												repeatType: 'loop',
												ease: 'easeInOut'
											}}
										>
											<span className="material-symbols-outlined text-3xl">
												{option.emoji}
											</span>
										</motion.div>
										<div className="flex-1">
											<p className="text-sm leading-relaxed font-medium">
												{option.text}
											</p>
										</div>
									</div>
									<motion.span 
										className={`text-sm px-3 py-1 rounded-full border-2 font-medium flex-shrink-0 ml-3 ${
											answers[currentQuestion.id] === option.key
												? (option.color === 'red' ? 'bg-red-500/20 border-red-400/50 text-red-200' :
												   option.color === 'orange' ? 'bg-orange-500/20 border-orange-400/50 text-orange-200' :
												   option.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-200' :
												   'bg-green-500/20 border-green-400/50 text-green-200')
												: 'bg-white/10 border-white/30 text-white/70'
										}`}
										animate={answers[currentQuestion.id] === option.key ? {
											scale: [1, 1.02, 1],
											opacity: [0.8, 1, 0.8]
										} : {}}
										transition={{ 
											duration: 3.0,
											repeat: answers[currentQuestion.id] === option.key ? Infinity : 0,
											repeatType: 'loop',
											ease: 'easeInOut'
										}}
									>
										{option.description}
									</motion.span>
								</div>
							</motion.button>
						))}
					</div>
				)}
			</motion.div>

			{/* Botones de Navegación */}
			<div className="flex justify-between items-center mt-6">
				<button
					onClick={handleBack}
					disabled={currentQuestionIndex === 0}
					className="py-3 px-6 rounded-lg text-sm font-semibold border border-gray-500 text-gray-300 hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Anterior
				</button>
				<button
					onClick={handleNext}
					disabled={isNextDisabled()}
					className="flex items-center py-3 px-6 rounded-lg text-sm font-semibold bg-[#B4B4B4] text-[#0A192F] hover:bg-[#B4B4B4] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Finalizar'}
					<span className="material-symbols-outlined ml-2 text-base">arrow_forward</span>
				</button>
			</div>
		</div>
	);
}
