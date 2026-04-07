import Link from 'next/link'

export default function Footer(){
  return (
    <footer className="w-full border-t bg-white text-slate-600 mt-10">
      <div className="max-w-full mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="font-semibold text-slate-900">© {new Date().getFullYear()} Cora Prep</p>
          <p className="text-sm">All rights reserved.</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Quick Links</p>
          <div className="mt-2 space-y-1 text-sm">
            <Link href="/" className="block transition duration-150 hover:text-primary hover:translate-x-0.5">Dashboard</Link>
            <Link href="/learn" className="block transition duration-150 hover:text-primary hover:translate-x-0.5">Practice</Link>
            <Link href="/vocab" className="block transition duration-150 hover:text-primary hover:translate-x-0.5">Vocab</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Resources</p>
          <div className="mt-2 space-y-1 text-sm">
            <a href="https://www.thebrainbee.org/" target="_blank" rel="noreferrer" className="block transition duration-150 hover:text-primary hover:translate-x-0.5">International Brain Bee</a>
            <a href="mailto:hello@coraprep.com?subject=Report%20a%20Typo%2FError" className="block transition duration-150 hover:text-primary hover:translate-x-0.5">Report a Typo/Error</a>
            <a href="#" className="block transition duration-150 hover:text-primary hover:translate-x-0.5">Social (X, Insta, LinkedIn)</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
