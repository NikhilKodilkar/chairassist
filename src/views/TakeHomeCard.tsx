export function TakeHomeCard({
  name,
  date,
  sentences,
}: {
  name: string;
  date: string;
  sentences: string[];
}) {
  return (
    <div className="card-veil">
      <article className="takehome">
        <p className="eyebrow">Chairside take-home</p>
        <h2>{name}</h2>
        <p>{date}</p>
        {sentences.map((sentence) => (
          <p key={sentence}>{sentence}</p>
        ))}
        <div className="toast">Sent to your phone</div>
      </article>
    </div>
  );
}
