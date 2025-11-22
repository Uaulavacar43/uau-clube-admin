import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-[#FF5226] mb-4">404</h1>
        <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">Página não encontrada</h2>
        <p className="mb-8 text-lg text-gray-600 sm:text-xl">
          Desculpe, não conseguimos encontrar a página que você está procurando.
        </p>
        <div className="w-full max-w-md mx-auto mb-8">
          <svg
            className="w-full h-auto"
            viewBox="0 0 1120 699"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 0H1120V699H0V0ZM0 0V699H1120V0H0Z"
              fill="#F6F6F7"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M626.751 364.301C628.884 366.543 628.88 370.195 626.744 372.432L575.026 426.195C572.89 428.433 569.39 428.437 567.249 426.204L515.249 372.204C513.108 369.971 513.104 366.319 515.24 364.081L566.957 310.319C569.094 308.08 572.594 308.077 574.735 310.31L626.751 364.301Z"
              fill="#FF5226"
            />
            <path
              d="M571.415 395.36C589.621 395.36 604.415 380.566 604.415 362.36C604.415 344.154 589.621 329.36 571.415 329.36C553.209 329.36 538.415 344.154 538.415 362.36C538.415 380.566 553.209 395.36 571.415 395.36Z"
              fill="white"
            />
            <path
              d="M571.415 379.36C580.8 379.36 588.415 371.745 588.415 362.36C588.415 352.975 580.8 345.36 571.415 345.36C562.03 345.36 554.415 352.975 554.415 362.36C554.415 371.745 562.03 379.36 571.415 379.36Z"
              fill="#FF5226"
            />
            <path
              d="M705.415 364.36H737.415"
              stroke="#E6E6E6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M721.415 348.36V380.36"
              stroke="#E6E6E6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M408.445 363.39H376.445"
              stroke="#E6E6E6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M571.445 197.39V229.39"
              stroke="#E6E6E6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M571.445 495.39V527.39"
              stroke="#E6E6E6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex justify-center">
          <Button
            className="bg-[#FF5226] hover:bg-[#FF5226]/90 text-white w-full sm:w-auto"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a página inicial
          </Button>
        </div>
      </div>
    </div>
  );
}
