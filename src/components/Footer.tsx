import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-2 mt-auto">
      <div className="container flex items-center justify-center mx-auto px-4 text-center">
        <div className="w-full flex flex-col md:flex-row justify-between items-center space-y-4">
          {/* FarmConnect Logo */}
          <div className="flex items-center justify-center space-x-3 mb-0">
            <Image src="https://cdn.chhatreshkhatri.com/icons/FarmConnect.svg" alt="FarmConnect" width={32} height={32} className="w-8 h-8" />
            <span className="text-xl font-bold">FarmConnect</span>
          </div>

          {/* Copyright */}
          <p className="mb-0 text-gray-400 text-sm">© {new Date().getFullYear()} FarmConnect • Built by Chhatresh Khatri</p>

          {/* Social Links */}
          <div className="flex space-x-6">
            <Link href="https://chhatreshkhatri.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2  transition-colors">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Image src="https://cdn.chhatreshkhatri.com/icons/icon.svg" alt="FarmConnect" width={32} height={32} className="w-8 h-8" />
              </div>
            </Link>
            <Link href="https://github.com/ChhatreshKhatri" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="GitHub">
              <Image src="https://cdn.chhatreshkhatri.com/icons/GitHub.svg" alt="GitHub" width={24} height={24} className="w-6 h-6" />
            </Link>

            <Link href="https://www.linkedin.com/in/chhatreshkhatri/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="LinkedIn">
              <Image src="https://cdn.chhatreshkhatri.com/icons/Linkedin.svg" alt="LinkedIn" width={24} height={24} className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
