import { Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { ThemeSwitcher } from "./components/theme-switcher";
import HomePage from "./pages/home";
import VenuesListPage from "./pages/venues-list";
import VenueDetailPage from "./pages/venue-detail";
import GetawayHubPage from "./pages/weekend-getaways";
import GetawayDetailPage from "./pages/getaway-detail";
import DestinationHubPage from "./pages/destination-weddings";
import ContactPage from "./pages/contact";
import VendorsHubPage from "./pages/vendors-hub";
import VendorCategoryPage from "./pages/vendor-category";
import RealWeddingsHub from "./pages/real-weddings";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />

      <Route path="/venues" component={VenuesListPage} />
      <Route path="/venues/:city/:locality/:slug" component={VenueDetailPage} />
      <Route path="/venues/:city/:slug" component={VenueDetailPage} />

      <Route path="/weekend-getaways" component={GetawayHubPage} />
      <Route path="/weekend-getaways/:slug" component={GetawayDetailPage} />

      <Route path="/destination-weddings" component={DestinationHubPage} />
      <Route path="/destination-weddings/:slug" component={DestinationHubPage} />

      <Route path="/contact" component={ContactPage} />

      <Route path="/vendors" component={VendorsHubPage} />
      <Route path="/vendors/:category" component={VendorCategoryPage} />
      <Route path="/vendors/:category/:slug" component={VendorCategoryPage} />

      <Route path="/real-weddings" component={RealWeddingsHub} />
      <Route path="/real-weddings/:slug" component={RealWeddingsHub} />

      <Route path="/about" component={() => <NotFound />} />
      <Route path="/blog" component={() => <NotFound />} />
      <Route path="/list-your-business" component={() => <NotFound />} />
      <Route path="/event-management" component={() => <NotFound />} />
      <Route path="/event-management/:sub" component={() => <NotFound />} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <>
      <Router />
      <ThemeSwitcher />
    </>
  );
}
