import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";

import Main from "../main/Main";
import Admin from "../admin/Admin";
import CreateGift from "../gift/CreateGift";
import RequestGift from "../gift/RequestGift";
import Collection from "../collection/Collection";
import { Nfts } from "../nfts/Nfts";
import {Brand} from "../brand/Brand"

export default function Global() {
  return (
    <Router>
      <div>
        {/* <ul>  
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/topics">Topics</Link>
          </li>
        </ul> */}
         <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/topics">
            <Topics />
          </Route>
          <Route path="/admin/create-gift">
            <CreateGift/>
          </Route>
          <Route path="/admin/request-gift">
            <RequestGift/>
          </Route>
          <Route path="/admin">
            <Admin/>
          </Route>
          <Route path="/brand">
            <Brand/>
          </Route>
          <Route path="/nfts/:addressContract">
            <Main/>
          </Route>
          <Route path="/gift">
            <Main/>
          </Route>
          <Route path="/gift-detail/:giftID">
            <Main/>
          </Route>
          <Route path="/gift-request">
            <Main/>
          </Route>
          {/* <Route path="/collection">
            <Collection/>
          </Route> */}
          <Route path="/">
            <Collection />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Topics() {
  let match = useRouteMatch();

  return (
    <div>
      <h2>Topics</h2>

      <ul>
        <li>
          <Link to={`${match.url}/components`}>Components</Link>
        </li>
        <li>
          <Link to={`${match.url}/props-v-state`}>
            Props v. State
          </Link>
        </li>
      </ul>

      {/* The Topics page has its own <Switch> with more routes
          that build on the /topics URL path. You can think of the
          2nd <Route> here as an "index" page for all topics, or
          the page that is shown when no topic is selected */}
      <Switch>
        <Route path={`${match.path}/:topicId`}>
          <Topic />
        </Route>
        <Route path={match.path}>
          <h3>Please select a topic.</h3>
        </Route>
      </Switch>
    </div>
  );
}

function Topic() {
  let { topicId } = useParams();
  return <h3>Requested topic ID: {topicId}</h3>;
}
