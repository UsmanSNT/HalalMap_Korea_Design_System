import { readFileSync, writeFileSync } from 'node:fs';
const edit = (path, fn) => writeFileSync(path, fn(readFileSync(path, 'utf8')));
edit('src/App.tsx', s => {
  s = s.replace('useEffect, useRef, useState', 'useEffect, useState').replace('login, logout', 'login, logout, getCurrentUser');
  s = s.replace('import DashboardApp from "./dashboard/DashboardApp";', 'const DashboardApp = React.lazy(() => import("./dashboard/DashboardApp"));');
  s = s.replace('import CourierApp from "./courier/CourierApp";', 'const CourierApp = React.lazy(() => import("./courier/CourierApp"));');
  s = s.replace('import AdminApp from "./admin/AdminApp";', 'const AdminApp = React.lazy(() => import("./admin/AdminApp"));');
  s = 'import { navigate as navigateRoute, useRoute, goBack } from "./services/navigation";\nimport FeatureNavigation from "./components/FeatureNavigation";\n' + s;
  s = s.replace('max-w-[390px] overflow-hidden', 'overflow-hidden').replace('max-w-[390px] overflow-hidden', 'overflow-hidden');
  s = s.replace('mx-auto h-full w-full overflow-hidden', 'customer-content mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden');
  s = s.replace('          {children}', '          <FeatureNavigation /><main className="min-h-0 flex-1">{children}</main>');
  s = s.replace(/  const \[workspace, setWorkspace\] = useState<[^;]+;/, '  const route = useRoute();\n  const workspace = route.workspace;\n  const setWorkspace = (mode: "customer" | "courier" | "owner" | "admin") => navigateRoute(`/${mode}/${mode === "owner" ? "main-dashboard" : mode === "courier" ? "go-online" : "home"}`);');
  const start = s.indexOf('  const [current, setCurrent]');
  const end = s.indexOf('  useEffect(() => {\n    localStorage', start);
  s = s.slice(0, start) + '  const current = route.screen as ScreenId;\n  const navigate = (screen: ScreenId) => navigateRoute(`/customer/${screen}`);\n  const [restoring, setRestoring] = useState(true);\n  useEffect(() => {\n    let live = true;\n    getCurrentUser().then(value => { if (live) setUser(value); }).finally(() => { if (live) setRestoring(false); });\n    return () => { live = false; };\n  }, []);\n\n' + s.slice(end);
  s = s.replace('    await logout();', '    try { await logout(); } catch { /* Local session is cleared even when the API is offline. */ }');
  s = s.replace('    setCurrent("home");\n    screenHistory.current = [];', '    navigateRoute("/customer/home", undefined, true);');
  s = s.replace('  if (!user) return <main', '  if (restoring) return <div role="status" className="p-8">Yuklanmoqda…</div>;\n  if (!user) return <main');
  s = s.replace('className="mx-auto h-dvh w-full overflow-hidden bg-[var(--cream)]"', 'className="auth-shell h-dvh w-full bg-[var(--cream)]"');
  s = s.replace('<LoginScreen onLogin={handleLogin} lang={lang} onLanguageChange={setLang} /></main>', '{current === "signup" ? <SignUpScreen /> : current === "onboarding" ? <OnboardingScreen /> : <LoginScreen onLogin={handleLogin} lang={lang} onLanguageChange={setLang} />}</main>');
  s = s.replace('    case "home": return <>\n      <div className="h-full lg:hidden"><HomeScreen onTabChange={onTabChange} onNavigate={onNavigate} /></div>\n      <div className="hidden h-full lg:block"><HomeDesktop onNavigate={onNavigate} onLogout={onLogout} lang={lang} onLanguageChange={onLanguageChange} /></div>\n    </>;', '    case "home": return <ResponsiveHome onTabChange={onTabChange} onNavigate={onNavigate} onLogout={onLogout} lang={lang} onLanguageChange={onLanguageChange} />;');
  s = s.replace('    case "apply-owner": return <RoleApplicationScreen role="owner" onAuthenticated={onWorkspace} />;', '    case "apply-owner": return <RoleApplicationScreen role="owner" onAuthenticated={onWorkspace} />;\n    default: return <div className="p-8"><h1 className="text-xl font-bold">Sahifa topilmadi</h1><button className="mt-4 text-[var(--green)]" onClick={() => onNavigate("home")}>Bosh sahifaga qaytish</button></div>;');
  s = s.replace('export default function App()', 'function ResponsiveHome(props: React.ComponentProps<typeof HomeDesktop> & { onTabChange: (tab: TabId) => void }) {\n  const [desktop, setDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);\n  useEffect(() => { const media = window.matchMedia("(min-width: 1024px)"); const update = () => setDesktop(media.matches); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);\n  return desktop ? <HomeDesktop {...props} /> : <HomeScreen onTabChange={props.onTabChange} onNavigate={props.onNavigate} />;\n}\n\nexport default function App()');
  s = s.replace('useRoute, goBack', 'useRoute');
  return s;
});
edit('src/main.tsx', s => s.replace("import './index.css'", "import './index.css'\nimport ActionDialog from './components/ActionDialog'").replace('    <App />', '    <React.Suspense fallback={<div role="status" className="p-8">Yuklanmoqda…</div>}><App /></React.Suspense>\n    <ActionDialog />'));
for (const [file, state, setter, type, workspace, fallback] of [
  ['src/dashboard/DashboardApp.tsx', 'screen', 'setScreen', 'DashScreen', 'owner', 'main-dashboard'],
  ['src/admin/AdminApp.tsx', 'current', 'setCurrent', 'AdminScreenId', 'admin', 'home'],
  ['src/courier/CourierApp.tsx', 'active', 'setActive', 'CourierScreenId', 'courier', 'go-online'],
]) edit(file, s => {
  s = 'import { useRouteScreen } from "../services/navigation";\n' + s;
  s = s.replace(new RegExp(`const \\[${state}, ${setter}\\] = useState<${type}>\\("[^"]+"\\);`), `const [${state}, ${setter}] = useRouteScreen<${type}>("${workspace}", "${fallback}");`);
  s = s.replace('flex h-screen w-screen overflow-hidden', `workspace-shell ${workspace}-shell flex h-dvh w-full overflow-hidden`);
  s = s.replace('flex-1 flex flex-col overflow-hidden', 'min-w-0 flex-1 flex flex-col overflow-hidden');
  if (workspace === 'admin') s = s.replace('onNavigate={() => {}}', 'onNavigate={id => setCurrent(id as AdminScreenId)}').replace('className="px-8 py-6"', 'className="px-4 py-4 lg:px-8 lg:py-6"');
  if (workspace === 'courier') {
    const start = s.indexOf('      {/* Content */}');
    s = s.slice(0,start) + '      <main className="min-w-0 min-h-0 flex-1" style={{ backgroundColor: C.bg }}>{renderCourierScreen(active, setActive)}</main>\n    </div>\n  );\n}\n';
  }
  return s;
});
edit('src/components/Shared.tsx', s => {
  s = 'import { navigate, goBack } from "../services/navigation";\n' + s;
  s = s.replace('onClick={() => onTabChange?.(t.id)}', 'onClick={() => onTabChange ? onTabChange(t.id) : navigate(`/customer/${({ home: "home", search: "search", orders: "order-history", prayer: "prayer-times", profile: "profile" })[t.id]}`)}');
  s = s.replace('onClick={onBack ?? (() => window.dispatchEvent(new CustomEvent("halalmap:back")))}', 'aria-label="Orqaga" onClick={onBack ?? (() => goBack())}');
  s = s.replace('w-9 h-9 rounded-full flex items-center justify-center', 'w-11 h-11 rounded-full flex items-center justify-center');
  s = s.replace('onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0', 'onClick={onClick ?? (() => navigate("/customer/restaurant-detail", { place: name }))} className="bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0');
  s = s.replace('onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-stretch', 'onClick={onClick ?? (() => navigate("/customer/restaurant-detail", { place: name }))} className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-stretch');
  s = s.replace('onClick={onClick} className="bg-white rounded-2xl p-4 shadow-sm', 'onClick={onClick ?? (() => navigate("/customer/mosque-detail", { place: name }))} className="bg-white rounded-2xl p-4 shadow-sm');
  return s;
});
edit('src/courier/CourierShared.tsx', s => 'import { navigate } from "../services/navigation";\n' + s.replace('onClick={() => onTabChange?.(item.id)}', 'onClick={() => onTabChange ? onTabChange(item.id) : navigate(`/courier/${({ home: "go-online", deliveries: "history", earnings: "earnings", profile: "courier-profile" })[item.id]}`)}').replace('className="flex-shrink-0 flex items-center justify-around', 'className="courier-bottom-nav lg:hidden flex-shrink-0 flex items-center justify-around'));
edit('src/screens/HomeDesktop.tsx', s => s.replace('height: "100dvh"', 'height: "100%"').replace('gridTemplateColumns: "1fr 300px"', 'gridTemplateColumns: "minmax(0, 1fr) minmax(220px, 28%)"').replace('gridTemplateColumns: "repeat(3, 1fr)"', 'gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))"'));
edit('index.html', s => s.replace('initial-scale=1.0', 'initial-scale=1.0, viewport-fit=cover'));
