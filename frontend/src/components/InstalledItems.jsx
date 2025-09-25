import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const useSortableData = (items, config = []) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.length > 0) {
      sortableItems.sort((a, b) => {
        for (const { key, direction } of sortConfig) {
          if (a[key] < b[key]) {
            return direction === 'ascending' ? -1 : 1;
          }
          if (a[key] > b[key]) {
            return direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key, multi = false, fromDropdown = false) => {
    let newConfig = [...sortConfig];
    const keyIndex = newConfig.findIndex(c => c.key === key);

    if (fromDropdown) {
      // If sorting from dropdown, always make it a single sort
      if (keyIndex !== -1) {
        newConfig[keyIndex].direction = newConfig[keyIndex].direction === 'ascending' ? 'descending' : 'ascending';
        newConfig = [newConfig[keyIndex]];
      } else {
        newConfig = [{ key, direction: 'ascending' }];
      }
    } else if (multi) {
      if (keyIndex !== -1) {
        // Toggle direction if key exists
        newConfig[keyIndex].direction = newConfig[keyIndex].direction === 'ascending' ? 'descending' : 'ascending';
      } else {
        // Add new key to sort config
        newConfig.push({ key, direction: 'ascending' });
      }
    } else {
      if (keyIndex !== -1) {
        // Just toggle direction
        newConfig[keyIndex].direction = newConfig[keyIndex].direction === 'ascending' ? 'descending' : 'ascending';
        // If not multi-sort, it becomes the primary sort key
        newConfig = [newConfig[keyIndex]];
      } else {
        // Set as the only sort key
        newConfig = [{ key, direction: 'ascending' }];
      }
    }
    setSortConfig(newConfig);
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const InstalledItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/officer/fittings`);
        setItems(response.data);
      } catch (err) {
        setError('Failed to fetch installed items.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === 'all') {
      return items;
    }
    return items.filter(item => item.installation_status === filter);
  }, [items, filter]);

  const { items: sortedItems, requestSort, sortConfig } = useSortableData(filteredItems);

  const getSortDirection = (name) => {
    const config = sortConfig.find(c => c.key === name);
    if (!config) return '';
    const priority = sortConfig.findIndex(c => c.key === name) + 1;
    return config.direction === 'ascending' ? ` 🔼${priority}` : ` 🔽${priority}`;
  };

  if (loading) return <div>Loading installed items...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Installed Items & Maintenance</h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button className={`nav-link ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                All
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${filter === 'installed' ? 'active' : ''}`} onClick={() => setFilter('installed')}>
                Installed
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${filter === 'under_maintenance' ? 'active' : ''}`} onClick={() => setFilter('under_maintenance')}>
                Maintenance
              </button>
            </li>
          </ul>
          <div className="input-group w-auto">
            <label className="input-group-text" htmlFor="sort-select">Sort by:</label>
            <select 
              id="sort-select"
              className="form-select" 
              onChange={(e) => requestSort(e.target.value, false, true)}
              value={sortConfig.length > 0 ? sortConfig[0].key : ''}
            >
              <option value="fitting_id">Item ID</option>
              <option value="installer_name">Installer Name</option>
              <option value="installed_at">Install Date</option>
              <option value="location_lat">Location</option>
              <option value="installation_status">Status</option>
            </select>
            <button 
              className="btn btn-outline-secondary" 
              onClick={() => requestSort(sortConfig.length > 0 ? sortConfig[0].key : 'fitting_id', false, true)}
            >
              {sortConfig.length > 0 && sortConfig[0].direction === 'ascending' ? '🔼' : '🔽'}
            </button>
          </div>
        </div>
        <div className="table-responsive pt-3">
          <table className="table table-hover">
              <thead>
                  <tr>
                      <th onClick={() => requestSort('fitting_id')} style={{ cursor: 'pointer' }}>
                        Item ID{getSortDirection('fitting_id')}
                      </th>
                      <th onClick={() => requestSort('installer_name')} style={{ cursor: 'pointer' }}>
                        Installer Name{getSortDirection('installer_name')}
                      </th>
                      <th onClick={() => requestSort('installed_at')} style={{ cursor: 'pointer' }}>
                        Install Date{getSortDirection('installed_at')}
                      </th>
                      <th onClick={() => requestSort('location_lat')} style={{ cursor: 'pointer' }}>
                        Location{getSortDirection('location_lat')}
                      </th>
                      <th onClick={() => requestSort('installation_status')} style={{ cursor: 'pointer' }}>
                        Status{getSortDirection('installation_status')}
                      </th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                {sortedItems.length > 0 ? sortedItems.map(item => (
                  <tr key={item.fitting_id}>
                    <td>{item.fitting_id}</td>
                    <td>{item.installer_name || 'N/A'}</td>
                    <td>{new Date(item.installed_at).toLocaleDateString()}</td>
                    <td>{item.location_lat && item.location_long ? `${item.location_lat}, ${item.location_long}` : 'N/A'}</td>
                    <td>
                      <span className={`badge ${item.installation_status === 'installed' ? 'bg-success' : 'bg-warning'}`}>
                        {item.installation_status}
                      </span>
                    </td>
                    <td>
                        <button className="btn btn-sm btn-outline-primary">View/Add Log</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center">No items found.</td>
                  </tr>
                )}
              </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstalledItems;
