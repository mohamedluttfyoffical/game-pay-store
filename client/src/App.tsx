import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import { InformationPage } from "./pages/Information";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import ProductDetails from "./pages/ProductDetails";
import Account from "./pages/Account";
import { AuthPage } from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import Notifications from "./pages/Notifications";
import { PageTransition } from "./components/PageTransition";
import AdminNavigation from "./pages/AdminNavigation";
import { BrandFavicon } from "./components/BrandFavicon";
import AdminBranding from "./pages/AdminBranding";
import AdminHomeEditor from "./pages/AdminHomeEditor";
import AdminFiles from "./pages/AdminFiles";
import AdminProductCreate from "./pages/AdminProductCreate";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/store"} component={Catalog} />
      <Route path={"/product/:slug"} component={ProductDetails} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/orders"} component={Orders} />
      <Route path={"/account"} component={Account} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/login"}>{() => <AuthPage mode="login" />}</Route>
      <Route path={"/register"}>{() => <AuthPage mode="register" />}</Route>
      <Route path={"/forgot-password"}>{() => <AuthPage mode="forgot-password" />}</Route>
      <Route path={"/order-success/:reference"} component={OrderSuccess} />
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path={"/admin/navigation"} component={AdminNavigation} />
      <Route path={"/admin/branding"} component={AdminBranding} />
      <Route path={"/admin/home-editor"} component={AdminHomeEditor} />
      <Route path={"/admin/files"} component={AdminFiles} />
      <Route path={"/admin/products/new"} component={AdminProductCreate} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/about"}>{() => <InformationPage kind="about" />}</Route>
      <Route path={"/contact"}>{() => <InformationPage kind="contact" />}</Route>
      <Route path={"/faq"}>{() => <InformationPage kind="faq" />}</Route>
      <Route path={"/privacy"}>{() => <InformationPage kind="privacy" />}</Route>
      <Route path={"/terms"}>{() => <InformationPage kind="terms" />}</Route>
      <Route path={"/refund"}>{() => <InformationPage kind="refund" />}</Route>
      <Route path={"/digital-delivery"}>{() => <InformationPage kind="digital-delivery" />}</Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <CartProvider>
          <TooltipProvider>
            <BrandFavicon />
            <Toaster />
            <PageTransition>
              <Router />
            </PageTransition>
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
