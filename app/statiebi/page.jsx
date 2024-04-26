import { BrowserRouter as Router, Route } from 'react-router-dom';
import ArticlePage from './ArticlePage';

const Page = () => {
  return (
    <Router>
      <Route path="/article/:id" render={(props) => <ArticlePage articleId={props.match.params.id} />} />
    </Router>
  );
}

export default Page;
