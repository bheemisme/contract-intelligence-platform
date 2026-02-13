import React, { useState } from 'react';
import { Link, useLocation, useNavigate, type NavigateFunction } from 'react-router';
import { useDeleteAgent, useGetAllAgents } from "@/queries/agents"
import AgentForm from "./AgentForm";
import { useQueryClient } from '@tanstack/react-query';

const buildChatSubItems = (navigate: NavigateFunction) => {
  const agents = useGetAllAgents()
  const queryClient = useQueryClient()

  if (agents.error?.cause === 401) {
    queryClient.clear()
    sessionStorage.setItem('isJustLoggedOut', 'true')
    navigate('/')
  }
  return agents.data?.map((val) => ({
    path: `/chat/${val.agent_id}`,
    label: val.name,
    icon: '📄',
    agent_id: val.agent_id
  })) || []
};

const navItems = (chats: Array<{ path: string; label: string; icon: string, agent_id: string }>) => [
  { path: '/contracts', label: 'Contracts', icon: '📄' },
  { label: 'Chat', icon: '💬', subItems: chats },
  { path: '/account', label: 'Account', icon: '👤' },
];

interface DesktopNavItemsListProps {
  items: ReturnType<typeof navItems>;
  location: ReturnType<typeof useLocation>;
  isChatOpen: boolean;
  toggleChat: () => void;
  isAgentFormOpen: boolean;
  setIsAgentFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface MobileNavItemListProps {
  items: ReturnType<typeof navItems>;
  location: ReturnType<typeof useLocation>;
  isChatOpen: boolean;
  toggleChat: () => void;
  closeMobileMenu: () => void;
  isAgentFormOpen: boolean;
  setIsAgentFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
}

const DesktopNavItemsList: React.FC<DesktopNavItemsListProps> = (props) => {
  const deleteAgent = useDeleteAgent()
  const queryClient = useQueryClient()

  return (
    <nav className="flex-1 px-4 py-4 space-y-2">
      {props.items.map((item, idx) => (
        <div key={idx}>
          {item.subItems ? (
            <div>
              <div
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname.startsWith('/chat')
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
              >
                <button onClick={props.toggleChat} className="flex items-center flex-1">
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      props.setIsAgentFormOpen(!props.isAgentFormOpen);
                    }}
                    className="p-1 rounded hover:bg-green-600 transition-colors"
                    title="New Chat"
                  >
                    ➕
                  </button>
                  <button
                    onClick={props.toggleChat}
                    className="p-1 rounded hover:bg-green-600 transition-colors"
                  >
                    ▼
                  </button>
                </div>
              </div>
              {props.isChatOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((subItem, idx) => (
                    <div className="flex flex-row items-center justify-between" key={idx}>
                      <Link
                        to={subItem.path}
                        className={`flex items-center px-4 py-2 text-xs font-medium rounded-md transition-colors ${location.pathname === subItem.path
                          ? 'bg-green-600 text-white'
                          : 'text-green-200 hover:bg-green-600 hover:text-white'
                          }`}
                      >
                        <span className="mr-2">{subItem.icon}</span>
                        {subItem.label}
                      </Link>
                      <button className='cursor-pointer' onClick={() => {
                        deleteAgent.mutate(subItem.agent_id, {
                          onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: ["agents"] })
                          },
                          onError: (error) => {
                            console.error("Error deleting agent:", error);
                          }
                        })
                      }}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 30 30">
                          <path d="M 13 3 A 1.0001 1.0001 0 0 0 11.986328 4 L 6 4 A 1.0001 1.0001 0 1 0 6 6 L 24 6 A 1.0001 1.0001 0 1 0 24 4 L 18.013672 4 A 1.0001 1.0001 0 0 0 17 3 L 13 3 z M 6 8 L 6 24 C 6 25.105 6.895 26 8 26 L 22 26 C 23.105 26 24 25.105 24 24 L 24 8 L 6 8 z"></path>
                        </svg></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              to={item.path!}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === item.path
                ? 'bg-green-700 text-white'
                : 'text-green-100 hover:bg-green-700 hover:text-white'
                }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          )}
        </div>)
      )}
    </nav>
  );
};

const MobileNavItemList: React.FC<MobileNavItemListProps> = (props) => {
  const queryClient = useQueryClient();
  const deleteAgent = useDeleteAgent();
  return (
    <nav className="flex-1 px-4 py-4 space-y-2">
      {props.items.map((item, idx) => (
        <div key={idx}>
          {item.subItems ? (
            <div>
              <div
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname.startsWith('/chat')
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
              >
                <button onClick={props.toggleChat} className="flex items-center flex-1">
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      props.setIsAgentFormOpen(!props.isAgentFormOpen);
                    }}
                    className="p-1 rounded hover:bg-green-600 transition-colors"
                    title="New Chat"
                  >
                    ➕
                  </button>
                  <button
                    onClick={props.toggleChat}
                    className="p-1 rounded hover:bg-green-600 transition-colors"
                  >
                    ▼
                  </button>
                </div>
              </div>
              {props.isChatOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((subItem, idx) => (
                    <div className="flex flex-row items-center justify-between" key={idx}>
                      <Link
                        to={subItem.path}
                        onClick={props.closeMobileMenu}
                        className={`flex items-center px-4 py-2 text-xs font-medium rounded-md transition-colors ${location.pathname === subItem.path
                          ? 'bg-green-600 text-white'
                          : 'text-green-200 hover:bg-green-600 hover:text-white'
                          }`}
                      >
                        <span className="mr-2">{subItem.icon}</span>
                        {subItem.label}
                      </Link>
                      <button className='cursor-pointer' onClick={() => {
                        deleteAgent.mutate(subItem.agent_id, {
                          onSuccess: () => {
                            queryClient.refetchQueries({queryKey: ['agents']})
                          }
                        })
                      }}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 30 30">
                        <path d="M 13 3 A 1.0001 1.0001 0 0 0 11.986328 4 L 6 4 A 1.0001 1.0001 0 1 0 6 6 L 24 6 A 1.0001 1.0001 0 1 0 24 4 L 18.013672 4 A 1.0001 1.0001 0 0 0 17 3 L 13 3 z M 6 8 L 6 24 C 6 25.105 6.895 26 8 26 L 22 26 C 23.105 26 24 25.105 24 24 L 24 8 L 6 8 z"></path>
                      </svg></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              to={item.path!}
              onClick={() => {
                props.closeMobileMenu();
              }}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === item.path
                ? 'bg-green-700 text-white'
                : 'text-green-100 hover:bg-green-700 hover:text-white'
                }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatSubmenuOpen, setIsChatSubmenuOpen] = useState(false);

  const chats = buildChatSubItems(navigate);
  const items = navItems(chats);

  const [isAgentFormOpen, setIsAgentFormOpen] = useState(false);
  const toggleChat = () => setIsChatSubmenuOpen(open => !open);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);



  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:bg-green-800 md:text-white">
        <div className="flex items-center justify-center h-16 bg-green-900">
          <h1 className="text-xl font-bold">CIP</h1>
        </div>
        {isAgentFormOpen && <AgentForm className="top-1/2 left-1/2 transform -translate-y-1/2 duration-1000" setIsAgentFormOpen={setIsAgentFormOpen} />}
        <DesktopNavItemsList
          items={items}
          location={location}
          isChatOpen={isChatSubmenuOpen}
          toggleChat={toggleChat}
          isAgentFormOpen={isAgentFormOpen}
          setIsAgentFormOpen={setIsAgentFormOpen}

        />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-green-800 text-white z-50">
        {isAgentFormOpen && <AgentForm className=" left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" setIsAgentFormOpen={setIsAgentFormOpen} />}

        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold">CIP</h1>
          <button
            onClick={() => setIsMobileMenuOpen(open => !open)}
            className="p-2 rounded-md hover:bg-green-700 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-green-800 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-center h-16 bg-green-900">
          <h1 className="text-xl font-bold">CIP</h1>
        </div>
        <MobileNavItemList
          items={items}
          location={location}
          isChatOpen={isChatSubmenuOpen}
          toggleChat={toggleChat}
          closeMobileMenu={closeMobileMenu}
          isAgentFormOpen={isAgentFormOpen}
          setIsAgentFormOpen={setIsAgentFormOpen}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30" onClick={closeMobileMenu} />
      )}

      {/* Mobile Spacer */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default Navigation;
