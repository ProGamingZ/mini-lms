import { useState } from 'react';

interface Link {
  label: string;
  url: string;
}

interface FolderProps {
  title: string;
  links: Link[];
}

export default function Folder({ title, links }: FolderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="folder-wrapper">
      <div className="folder-header" onClick={() => setIsOpen(!isOpen)}>
        <svg className="folder-icon" viewBox="0 0 24 24" fill="#fbc02d" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" />
        </svg>
        <span className="folder-title">{title}</span>
      </div>
      {isOpen && (
        <ul className="folder-links">
          {links.map((link, index) => (
            <li key={index}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                📄 {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}