export function Footer() {
  return (
    <footer className="border-t border-ivoire/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-ivoire-dim md:flex-row">
        <p>© {new Date().getFullYear()} Xwé IA. Tous droits réservés.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-ivoire">Confidentialité</a>
          <a href="#" className="hover:text-ivoire">Conditions</a>
          <a href="#" className="hover:text-ivoire">Contact</a>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-ivoire-dim/70">
        Un projet de{" "}
        <a
          href="https://mabidouz-mu14.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-or hover:underline"
        >
          Magnificat Bidouzo — AI Creative Strategist
        </a>
      </p>
    </footer>
  );
}
