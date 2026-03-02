import React, { useEffect, useState } from 'react';
import { Plus, Archive, Loader2, LayoutGrid, Activity, Users, MoreHorizontal } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { CompanySquad, CompanyBoard } from '../../types/company';
import { BoardForm } from './forms/BoardForm';
import { BoardView } from './BoardView';

interface SquadViewProps {
  squad: CompanySquad;
  onEditSquad: (squad: CompanySquad) => void;
}

export const SquadView: React.FC<SquadViewProps> = ({ squad, onEditSquad }) => {
  const { boards, boardsLoading, loadBoards, addBoard, updateBoard, archiveBoard } = useCompany();
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [editingBoard, setEditingBoard] = useState<CompanyBoard | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<CompanyBoard | null>(null);
  const [menuBoardId, setMenuBoardId] = useState<string | null>(null);

  useEffect(() => {
    loadBoards(squad.id);
    setSelectedBoard(null);
  }, [squad.id, loadBoards]);

  const handleBoardSubmit = async (data: Omit<CompanyBoard, 'id' | 'user_id' | 'created_at'>) => {
    if (editingBoard) {
      await updateBoard(editingBoard.id, data);
    } else {
      await addBoard(data);
    }
  };

  // If a board is selected, show its Kanban view
  if (selectedBoard) {
    return (
      <BoardView
        board={selectedBoard}
        onBack={() => setSelectedBoard(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Squad header */}
      <div className="flex items-center gap-4">
        <span
          className="text-3xl w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{ backgroundColor: `${squad.color}20` }}
        >
          {squad.icon}
        </span>
        <div>
          <h2 className="text-2xl font-bold text-white">{squad.name}</h2>
          {squad.description && (
            <p className="text-gray-400 text-sm">{squad.description}</p>
          )}
          <p className="text-gray-500 text-xs mt-0.5">
            {boards.length} {boards.length === 1 ? 'board' : 'boards'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => onEditSquad(squad)}
            className="px-3 py-2 glass border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors text-sm"
          >
            Editar Squad
          </button>
          <button
            onClick={() => { setEditingBoard(null); setShowBoardForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/80 transition-colors"
          >
            <Plus size={16} />
            Novo Board
          </button>
        </div>
      </div>

      {/* Boards grid */}
      {boardsLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gray-500" />
        </div>
      ) : boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-2xl bg-white/5 text-gray-500 mb-4">
            <LayoutGrid size={32} />
          </div>
          <h3 className="text-white font-semibold mb-2">Nenhum board ainda</h3>
          <p className="text-gray-500 text-sm mb-4">Crie o primeiro board para este squad</p>
          <button
            onClick={() => setShowBoardForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/80 transition-colors"
          >
            <Plus size={15} />
            Criar Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              className="glass rounded-2xl border border-white/5 hover:border-white/15 transition-all group cursor-pointer relative"
              onClick={() => setSelectedBoard(board)}
            >
              {/* Top accent line */}
              <div className="h-1 rounded-t-2xl" style={{ backgroundColor: board.color }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="text-xl w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ backgroundColor: `${board.color}20` }}
                  >
                    {board.icon}
                  </span>
                  {/* Context menu button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuBoardId(menuBoardId === board.id ? null : board.id); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <h3 className="text-white font-semibold text-sm group-hover:text-accent transition-colors mb-1">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="text-gray-500 text-xs line-clamp-2">{board.description}</p>
                )}

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Activity size={11} />
                    0 tasks
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Users size={11} />
                    0 membros
                  </div>
                </div>
              </div>

              {/* Context menu dropdown */}
              {menuBoardId === board.id && (
                <div
                  className="absolute top-12 right-2 z-20 glass border border-white/10 rounded-xl py-1 shadow-xl min-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => { setEditingBoard(board); setShowBoardForm(true); setMenuBoardId(null); }}
                  >
                    Editar Board
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                    onClick={async () => { await archiveBoard(board.id); setMenuBoardId(null); }}
                  >
                    <Archive size={13} />
                    Arquivar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Board form modal */}
      {showBoardForm && (
        <BoardForm
          squadId={squad.id}
          initial={editingBoard || undefined}
          onSubmit={handleBoardSubmit}
          onClose={() => { setShowBoardForm(false); setEditingBoard(null); }}
        />
      )}
    </div>
  );
};
