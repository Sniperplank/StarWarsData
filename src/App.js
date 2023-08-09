import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './App.css';

function App() {
  const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row

  // initialize columns with the appropriate field names. These names match the names in the API's results 
  const [columnDefs, setColumnDefs] = useState([
    { field: 'name', filter: true }, // use the default column filter which is 'agTextColumnFilter'
    { field: 'height', filter: 'agNumberColumnFilter' }, // the 'agNumberColumnFilter' changes the values in the dropdown menu to be specific for numbers
    { field: 'mass', filter: 'agNumberColumnFilter'  },
    { field: 'hair_color', filter: true  },
    { field: 'skin_color', filter: true  },
    { field: 'eye_color', filter: true  },
    { field: 'birth_year', filter: true  },
    { field: 'gender', filter: true  },
    { field: 'homeworld', filter: true  },
    { field: 'films', filter: 'agNumberColumnFilter'  }, // set as 'agNumberColumnFilter' because we will display the count instead
    { field: 'species', filter: true  },
    { field: 'vehicles', filter: 'agNumberColumnFilter'  }, // set as 'agNumberColumnFilter' because we will display the count instead
    { field: 'starships', filter: 'agNumberColumnFilter'  }, // set as 'agNumberColumnFilter' because we will display the count instead
    { field: 'created', filter: true  },
    { field: 'edited', filter: true  },
    { field: 'url', filter: true  }
  ]);

  // set properties for all columns
  const defaultColDef = useMemo(() => ({
    // flex: 1,
    sortable: true, // be able to sort columns 
    floatingFilter: true, // display an input field under each header for faster filtering
    debounceMs: 0 // latency for row filter updates
  }));

  // load data from swapi api
  useEffect(() => {
    fetch('https://swapi.dev/api/people')
      .then(result => result.json()) // parse the JSON data here
      .then(async (data) => {
        let peopleData = data.results // initialize data array with first page's results
        let nextPage = data.next // set next page url

        while (nextPage != null) {
          const response = await fetch(nextPage)
          const nextPageData = await response.json()
          peopleData = [...peopleData, ...nextPageData.results] // merge next page's data with previous data
          nextPage = nextPageData.next // update next page url
        }

        // update some fields to display count instead of url. (we could fetch and get details about all fields and expand furthur. However, it would 
        // take very long time to run because it would create too many calls to the API)
        for (let i = 0; i < peopleData.length; i++) { // loop through objects in the results array
          const person = peopleData[i];
          person.films = person.films.length
          person.species = person.species.length > 0 ? person.species.length : 'n/a'
          person.starships = person.starships.length > 0 ? person.starships.length : 0
          person.vehicles = person.vehicles.length > 0 ? person.vehicles.length : 0

          const homeWorldResponse = await fetch(person.homeworld) // make an API call to get the home world name and set it as the person's homeworld
          const homeWorldData = await homeWorldResponse.json()
          person.homeworld = homeWorldData.name
        }

        setRowData(peopleData);
      })
      .catch(error => {
        console.error('An error occured', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="ag-theme-alpine" style={{ width: '100%', height: '100%' }}>
          <AgGridReact
            rowData={rowData} // Row Data for Rows

            columnDefs={columnDefs} // Column Defs for Columns
            defaultColDef={defaultColDef} // Default Column Properties

            animateRows={true} // have rows animate when sorted
          />
        </div>
      </header>
    </div>
  );
}

export default App;
