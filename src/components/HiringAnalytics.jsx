import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Container,
  Divider,
} from "@mui/material";
import CustomBarChart from "./BarChart";
import SmartTooltip from "./SmartTooltip";

const candidates = [
  { name: "Riya Mehta", role: "Frontend Engineer", yoe: 3, notice: "15 days", status: "Interviewing" },
  { name: "Amit Rao", role: "Backend Engineer", yoe: 5, notice: "30 days", status: "Offered" },
  { name: "Sneha Patil", role: "Product Manager", yoe: 4, notice: "Serving", status: "Rejected" },
  { name: "Karan Gill", role: "DevOps Engineer", yoe: 2, notice: "7 days", status: "Interviewing" },
];

const metrics = [
  { title: "Total Hires", value: "132" },
  { title: "Time to Hire", value: "24 days" },
  { title: "Open Positions", value: "17" },
  { title: "Offer Acceptance Rate", value: "82%" },
];

export default function HiringAnalytics() {
  return (
    <Box sx={{ backgroundColor: "#f5f5f5", py: 4 }}>
      <Container maxWidth={false} sx={{ px: 4, width: "100%" }}>
        {/* Heading */}
        <Typography variant="h4" gutterBottom>
          <SmartTooltip keyword="Hiring Analytics Dashboard">
            Hiring Analytics
          </SmartTooltip>
        </Typography>

        {/* Bar Chart */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="h6"></Typography>
          <SmartTooltip keyword="Hires by Month"  >Hires by Month </SmartTooltip>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 5, width: "100%" }}>
          <Box sx={{ width: "100%", height: 400 }}>
            <CustomBarChart />
          </Box>
        </Paper>

        {/* Metrics Table */}
        <Typography variant="h6" gutterBottom>
          <SmartTooltip keyword="Key Hiring Metrics">
            Key Metrics
          </SmartTooltip>
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 5 }}>
          <Table size="small">
            <TableBody>
              {metrics.map((metric, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontWeight: "bold", width: "50%" }}>
                    <SmartTooltip keyword={metric.title}>
                      {metric.title}
                    </SmartTooltip>
                  </TableCell>
                  <TableCell>{metric.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Candidates Table */}
        <Typography variant="h6" gutterBottom>
          <SmartTooltip keyword="Candidates Table">
            Candidates
          </SmartTooltip>
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 5 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <SmartTooltip keyword="Candidate Name">Name</SmartTooltip>
                </TableCell>
                <TableCell>
                  <SmartTooltip keyword="Candidate Role">Role</SmartTooltip>
                </TableCell>
                <TableCell>
                  <SmartTooltip keyword="Years of Experience">Experience</SmartTooltip>
                </TableCell>
                <TableCell>
                  <SmartTooltip keyword="Notice Period">Notice Period</SmartTooltip>
                </TableCell>
                <TableCell>
                  <SmartTooltip keyword="Hiring Status">Status</SmartTooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((c, idx) => (
                <TableRow key={idx}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.role}</TableCell>
                  <TableCell>{c.yoe} yrs</TableCell>
                  <TableCell>{c.notice}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        c.status === "Offered"
                          ? "green"
                          : c.status === "Rejected"
                          ? "red"
                          : "blue",
                    }}
                  >
                    {c.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
