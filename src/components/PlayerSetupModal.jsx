import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  players: z.array(
    z.object({
      name: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres').max(20, 'Máximo 20 caracteres')
    })
  ).min(3, 'Você precisa definir no mínimo 3 jogadores')
});

const PlayerSetupModal = ({ onSetupComplete }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      players: [{ name: '' }, { name: '' }, { name: '' }]
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "players"
  });

  const onSubmit = (data) => {
    onSetupComplete(data.players.map(p => p.name));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Configure os Jogadores</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Digite o nome dos 3 participantes. Isso só precisa ser feito uma vez.</p>
          {fields.map((field, index) => (
            <div key={field.id} className="mb-4">
              <input
                type="text"
                {...register(`players.${index}.name`)}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.players?.[index]?.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={`Nome do Jogador ${index + 1}`}
              />
              {errors.players?.[index]?.name && (
                <span className="text-red-500 text-sm mt-1">{errors.players[index].name.message}</span>
              )}
            </div>
          ))}
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition">
            Salvar Jogadores
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerSetupModal;
