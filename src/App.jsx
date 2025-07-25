// import React from "react";
// import SmartTooltip from "./components/SmartTooltip";
// import { Typography, Box } from "@mui/material";

// function App() {
//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h5">
//         Annual Compensation <SmartTooltip label="Annual Compensation" />
//       </Typography>
//       <Typography variant="body1" sx={{ mt: 3 }}>
//         FTE Ratio <SmartTooltip label="FTE (Full-Time Equivalent)" />
//       </Typography>
//       <Typography variant="body1" sx={{ mt: 3 }}>
//         Cost Center <SmartTooltip label="Cost Center" />
//       </Typography>
//     </Box>
//   );
// }

// export default App;

// App.jsx
import HiringAnalytics from "./components/HiringAnalytics";

export default function App() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <HiringAnalytics />
    </div>
  );
}

