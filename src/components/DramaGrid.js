import DramaCard from "@/components/DramaCard";

export default function DramaGrid({ dramas }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {dramas.map((drama, index) => (
        <DramaCard key={drama.id} drama={drama} priority={index < 3} />
      ))}
    </div>
  );
}
