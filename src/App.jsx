import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './components/Home'
import UploadCSV from './components/UploadCSV'
import SearchContacts from './components/SearchContacts'
import ExportContacts from './components/ExportContacts'


function App() {
  return (
    <>
      <Navbar />
      <div className='App'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload-csv" element={<UploadCSV />} />
          <Route path="/search-contacts" element={<SearchContacts />} />
          <Route path="/export-contacts" element={<ExportContacts />} />
        </Routes>
      </div>
    </>
  )
}

export default App