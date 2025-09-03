import { NavLink } from 'react-router-dom';
import { FileText, CheckSquare, MessageCircle, Folder } from 'lucide-react';

export const Navigation = () => {
  const navigationItems = [
    { title: 'Ärenden', path: '/cases', icon: FileText },
    { title: 'Checklista/brister', path: '/checklist', icon: CheckSquare },
    { title: 'Tillsynsassistenten', path: '/', icon: MessageCircle },
    { title: 'Filer', path: '/files', icon: Folder },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center space-x-8 h-16">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};