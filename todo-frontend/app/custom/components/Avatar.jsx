// Helper function to generate a consistent color from a string
const getHashColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // A list of professional UI colors to pick from
  const colors = [
    'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 
    'bg-rose-600', 'bg-amber-600', 'bg-cyan-600', 
    'bg-indigo-600', 'bg-orange-600'
  ];
  
  // Use the hash to pick an index from the array
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const UserAvatar = ({ name }) => {
  if (!name || typeof name !== 'string') {
    return <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />;
  }

  // Get consistent color
  const bgColor = getHashColor(name);

  const parts = name.trim().split(/\s+/);
  const initials = parts.length === 1 
    ? parts[0][0] 
    : parts[0][0] + parts[parts.length - 1][0];

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgColor} text-white font-bold text-xs shadow-inner`}>
      {initials.toUpperCase().slice(0, 2)}
    </div>
  );
};