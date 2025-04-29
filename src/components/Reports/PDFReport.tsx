
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink
} from '@react-pdf/renderer';
import { departments, projects, teamMembers, resourceRequests } from '@/data/mockData';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
  },
  boldText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  table: {
    width: 'auto',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold',
  },
  tableCell: {
    width: '25%',
    paddingHorizontal: 5,
    fontSize: 9,
  },
  tableCell30: {
    width: '30%',
    paddingHorizontal: 5,
    fontSize: 9,
  },
  tableCell20: {
    width: '20%',
    paddingHorizontal: 5,
    fontSize: 9,
  },
  tableCell15: {
    width: '15%',
    paddingHorizontal: 5,
    fontSize: 9,
  },
  tableCell10: {
    width: '10%',
    paddingHorizontal: 5,
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

// Create Document Component
const PDFDocument = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header and Overview */}
        <View style={styles.section}>
          <Text style={styles.header}>Team Management Report</Text>
          <Text style={styles.text}>Generated on: {currentDate}</Text>
          
          <View style={{ marginTop: 20 }}>
            <Text style={styles.subheader}>Overview</Text>
            <Text style={styles.text}>Total Departments: {departments.length}</Text>
            <Text style={styles.text}>Total Team Members: {teamMembers.length}</Text>
            <Text style={styles.text}>Total Projects: {projects.length}</Text>
            <Text style={styles.text}>Pending Resource Requests: {resourceRequests.filter(req => req.status === 'pending').length}</Text>
          </View>
        </View>
        
        {/* Departments Section */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Departments</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell30}>Name</Text>
              <Text style={styles.tableCell30}>Lead</Text>
              <Text style={styles.tableCell20}>Members</Text>
              <Text style={styles.tableCell20}>Projects</Text>
            </View>
            
            {departments.map((department, i) => {
              const lead = teamMembers.find(m => m.id === department.leadId)?.name || 'Unassigned';
              const memberCount = department.memberCount;
              const deptProjects = projects.filter(p => 
                p.teamMembers.some(tm => 
                  teamMembers.find(m => m.id === tm)?.department === department.name
                )
              );
              
              return (
                <View style={styles.tableRow} key={i}>
                  <Text style={styles.tableCell30}>{department.name}</Text>
                  <Text style={styles.tableCell30}>{lead}</Text>
                  <Text style={styles.tableCell20}>{memberCount}</Text>
                  <Text style={styles.tableCell20}>{deptProjects.length}</Text>
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Resource Allocation */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Resource Allocation</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell30}>Team Member</Text>
              <Text style={styles.tableCell15}>Department</Text>
              <Text style={styles.tableCell15}>Projects</Text>
              <Text style={styles.tableCell15}>Availability</Text>
              <Text style={styles.tableCell15}>Office Days</Text>
              <Text style={styles.tableCell10}>Status</Text>
            </View>
            
            {teamMembers.slice(0, 20).map((member, i) => {
              const daysCount = Object.values(member.officeDays || {}).filter(Boolean).length;
              
              return (
                <View style={styles.tableRow} key={i}>
                  <Text style={styles.tableCell30}>{member.name}</Text>
                  <Text style={styles.tableCell15}>{member.department}</Text>
                  <Text style={styles.tableCell15}>{member.projects?.length || 0}</Text>
                  <Text style={styles.tableCell15}>{member.availability}%</Text>
                  <Text style={styles.tableCell15}>{daysCount}/5 days</Text>
                  <Text style={styles.tableCell10}>{member.availability >= 70 ? 'Available' : 'Limited'}</Text>
                </View>
              );
            })}
            
            {teamMembers.length > 20 && (
              <View style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, width: '100%', fontStyle: 'italic' }}>
                  ... and {teamMembers.length - 20} more team members
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Resource Requests */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Pending Resource Requests</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell30}>Request Type</Text>
              <Text style={styles.tableCell30}>Requested By</Text>
              <Text style={styles.tableCell20}>Status</Text>
              <Text style={styles.tableCell20}>Priority</Text>
            </View>
            
            {resourceRequests.filter(req => req.status === 'pending').map((request, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.tableCell30}>{request.type}</Text>
                <Text style={styles.tableCell30}>
                  {teamMembers.find(m => m.id === request.requestedBy)?.name || 'Unknown'}
                </Text>
                <Text style={styles.tableCell20}>{request.status}</Text>
                <Text style={styles.tableCell20}>{request.priority}</Text>
              </View>
            ))}
            
            {resourceRequests.filter(req => req.status === 'pending').length === 0 && (
              <View style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, width: '100%', fontStyle: 'italic' }}>
                  No pending resource requests
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>This report was automatically generated. For questions, contact the HR department.</Text>
        </View>
      </Page>
    </Document>
  );
};

// Export a component that provides a download link
export default function PDFReport() {
  return (
    <PDFDownloadLink 
      document={<PDFDocument />} 
      fileName="general-report.pdf"
    >
      {({ loading }) => (
        loading ? "Generating PDF..." : "Download PDF"
      )}
    </PDFDownloadLink>
  );
}
