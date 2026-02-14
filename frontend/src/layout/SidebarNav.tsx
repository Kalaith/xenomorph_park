export type NavigationSectionId =
  | 'overview'
  | 'operations'
  | 'species'
  | 'facilities'
  | 'research'
  | 'campaign'
  | 'system';

export interface NavigationItem {
  id: NavigationSectionId;
  label: string;
  description: string;
}

interface SidebarNavProps {
  items: NavigationItem[];
  activeSection: NavigationSectionId;
  onSelectSection: (sectionId: NavigationSectionId) => void;
}

export function SidebarNav({ items, activeSection, onSelectSection }: SidebarNavProps) {
  return (
    <>
      <aside className="panel hidden h-fit p-3 lg:sticky lg:top-24 lg:block" aria-label="Primary navigation">
        <h2 className="section-title mb-3 px-2 text-sm uppercase tracking-wide text-slate-300">
          Sections
        </h2>
        <nav>
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.id}>
                <button
                  type="button"
                  className="nav-button"
                  data-active={item.id === activeSection}
                  onClick={() => onSelectSection(item.id)}
                  aria-current={item.id === activeSection ? 'page' : undefined}
                  title={item.description}
                >
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <nav className="panel overflow-x-auto p-2 lg:hidden" aria-label="Primary navigation">
        <ul className="flex min-w-max gap-2">
          {items.map(item => (
            <li key={item.id}>
              <button
                type="button"
                className="nav-button whitespace-nowrap px-3 py-1.5"
                data-active={item.id === activeSection}
                onClick={() => onSelectSection(item.id)}
                aria-current={item.id === activeSection ? 'page' : undefined}
                title={item.description}
              >
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
