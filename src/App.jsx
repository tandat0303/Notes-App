import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import Homepage from "./components/Homepage";
import Layout from "./components/Layout";
import NotesView from "./components/NotesView";
import NoteEditor from "./components/NoteEditor";
import ArchiveView from "./components/ArchiveView";
import SearchView from "./components/SearchView";
import TagsView from "./components/TagsView";
import SettingsView from "./components/SettingsView";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <SignedIn>
          <Layout>
            <Routes>
              <Route path="/" element={<NotesView />} />
              <Route path="/note/:noteId" element={<NoteEditor />} />
              <Route path="/new" element={<NoteEditor />} />
              <Route path="/archived" element={<ArchiveView />} />
              <Route path="/search" element={<SearchView />} />
              <Route path="/tags/:tag" element={<TagsView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </SignedIn>

        <SignedOut>
          <Homepage />
        </SignedOut>

        <Toaster richColors />
      </Router>
    </ThemeProvider>
  );
}
