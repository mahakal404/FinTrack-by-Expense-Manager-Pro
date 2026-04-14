import { Plus } from 'lucide-react';

export default function FloatingActionButton({ onClick }) {
  return (
    <button
      id="fab-add-transaction"
      onClick={onClick}
      className="fab"
      aria-label="Add Transaction"
      title="Add Transaction"
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
}
