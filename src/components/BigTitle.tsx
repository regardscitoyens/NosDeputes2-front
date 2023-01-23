export function BigTitle({
  label,
  secondLabel,
  heading,
}: {
  label: string
  secondLabel?: string
  heading?: string
}) {
  return (
    <>
      <h2 className="justify-left mt-6 mb-4 flex w-full items-baseline gap-2 border-b-4 border-dotted border-slate-500 pb-2 font-extrabold">
        <span className="block text-2xl">{label}</span>{' '}
        {secondLabel && (
          <span className="block text-2xl text-slate-400 ">{secondLabel}</span>
        )}
      </h2>
      {heading && (
        <p className="text-left text-lg  text-slate-600">{heading}</p>
      )}
    </>
  )
}
