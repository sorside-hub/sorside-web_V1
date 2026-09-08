/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Discography, ReleaseDetail } from './pages/Discography';
import { TheSide } from './pages/TheSide';
import { ArticleDetail } from './pages/TheSide/ArticleDetail';
import { About } from './pages/About';
import { Frequency } from './pages/Frequency';
import { AudioPlayerProvider } from './context/AudioPlayerContext';

export default function App() {
  return (
    <AudioPlayerProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="discography" element={<Discography />} />
          <Route path="discography/:slug" element={<ReleaseDetail />} />
          <Route path="the-side" element={<TheSide />} />
          <Route path="the-side/:slug" element={<ArticleDetail />} />
          <Route path="frequency" element={<Frequency />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </AudioPlayerProvider>
  );
}

