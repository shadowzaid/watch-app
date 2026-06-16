export default function Footer() {
  return (
    <footer className="bg-[#141414] text-[#737373] px-8 md:px-16 py-12 mt-16">
      <div className="max-w-5xl mx-auto">
        <p className="mb-6 text-sm">
          Questions? Call{' '}
          <a href="tel:1-844-505-2993" className="underline">
            1-844-505-2993
          </a>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6">
          {[
            'FAQ',
            'Help Center',
            'Account',
            'Media Center',
            'Investor Relations',
            'Jobs',
            'Ways to Watch',
            'Terms of Use',
            'Privacy',
            'Cookie Preferences',
            'Corporate Information',
            'Contact Us',
            'Speed Test',
            'Legal Notices',
            'Only on Watch',
          ].map(link => (
            <a key={link} href="#" className="hover:underline">
              {link}
            </a>
          ))}
        </div>
        <p className="text-xs">Watch — Built with TMDB</p>
      </div>
    </footer>
  )
}
