import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import Homepage from "./components/Homepage";
import Layout from "./components/layout/Layout";
import NotesView from "./components/notes/NotesView";
import NoteEditor from "./components/notes/NoteEditor";
import ArchiveView from "./components/notes/ArchiveView";
import SearchView from "./components/search/SearchView";
import TagsView from "./components/tags/TagsView";
import SettingsView from "./components/settings/SettingsView";
import { ThemeProvider } from "./context/ThemeContext";
import SharedNotePage from "./components/notes/SharedNotePage";
import { useCreateRecUser } from "./hooks/useCreateRecUser";

export default function App() {
  useCreateRecUser();
  
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="shared/:noteId" element={<SharedNotePage />} />

          <Route
              path="/"
              element={
                <>
                  <SignedOut>
                    <Homepage />
                  </SignedOut>
                </>
              }
          />
        </Routes>

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

        <Toaster richColors />
      </Router>
    </ThemeProvider>
  );
}
