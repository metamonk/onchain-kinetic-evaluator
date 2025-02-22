export default function Wrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center w-full max-w-3xl ${className}`}>
      {children}
    </div>
  );
}