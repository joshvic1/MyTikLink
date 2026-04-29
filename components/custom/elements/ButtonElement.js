import BottomSheet from "../ui/BottomSheet";

export default function EditButtonModal({ isOpen, onClose, element, onSave }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h3>Edit Button</h3>

      <input
        value={element.text}
        onChange={(e) => onSave({ text: e.target.value })}
        placeholder="Button text"
      />

      <input
        value={element.url}
        onChange={(e) => onSave({ url: e.target.value })}
        placeholder="https://..."
      />

      <input
        type="color"
        value={element.bg}
        onChange={(e) => onSave({ bg: e.target.value })}
      />

      <button onClick={onClose}>Done</button>
    </BottomSheet>
  );
}
