/** Re-mounts on every navigation, giving each page a short, subtle fade-in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade">{children}</div>;
}
