/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { JsonFormatter } from './pages/JsonFormatter';
import { RegexTester } from './pages/RegexTester';
import { CronBuilder } from './pages/CronBuilder';
import { ContrastChecker } from './pages/ContrastChecker';
import { ApiTester } from './pages/ApiTester';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="json-formatter" element={<JsonFormatter />} />
          <Route path="regex-tester" element={<RegexTester />} />
          <Route path="cron-builder" element={<CronBuilder />} />
          <Route path="contrast-checker" element={<ContrastChecker />} />
          <Route path="api-tester" element={<ApiTester />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
