import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer, 
  PDFDownloadLink 
} from '@react-pdf/renderer';
import { 
  TeamMember, 
  Department, 
  Project, 
  ResourceRequest, 
  AllocationData 
} from '@/data/mockData';
import { format } from 'date-fns';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  table: {
    width: 'auto',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 24,
  },
  tableHeader: {
    backgroundColor: '#F0F0F0',
  },
  tableCol: {
    width: '25%',
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
    padding: 5,
  },
  header: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  statBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: 'grey',
  },
  badge: {
    borderRadius: 3,
    padding: 3,
    fontSize: 8,
    backgroundColor: '#E2E2E2',
  },
  progressBar: {
    height: 5,
    backgroundColor: '#E2E2E2',
    borderRadius: 2,
    width: '100%',
    marginTop: 3,
  },
  progress: {
    height: 5,
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
});

// Create Document Component
const GeneralReportPDF = ({
  teamMembers,
  departments,
  projects,
  resourceRequests,
  allocationData
}: {
  teamMembers: TeamMember[];
  departments: Department[];
  projects: Project[];
  resourceRequests: ResourceRequest[];
  allocationData: AllocationData[];
}) => {
  const totalMembers = teamMembers.length;
  const totalDepartments = departments.length;
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const pendingRequests = resourceRequests.filter(r => r.status === 'Pending').length;
  
  const currentDate = format(new Date(), 'MMMM dd, yyyy');
  
  // Calculate department statistics
  const departmentStats = departments.map(dept => {
    const membersInDept = teamMembers.filter(member => member.department === dept.name).length;
    const projectsInDept = projects.filter(project => project.departmentId === dept.id).length;
    return {
      ...dept,
      actualMemberCount: membersInDept,
      projectCount: projectsInDept
    };
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>General Report</Text>
        <Text style={{ fontSize: 12, textAlign: 'center', marginBottom: 20 }}>Generated on {currentDate}</Text>

        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Overview</Text>
          
          <View style={styles.stats}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalMembers}</Text>
              <Text style={styles.statLabel}>Team Members</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalDepartments}</Text>
              <Text style={styles.statLabel}>Departments</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalProjects}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{activeProjects}</Text>
              <Text style={styles.statLabel}>Active Projects</Text>
            </View>
          </View>
        </View>

        {/* Departments Section */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Department Overview</Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCol}><Text style={styles.header}>Department</Text></View>
              <View style={styles.tableCol}><Text style={styles.header}>Lead</Text></View>
              <View style={styles.tableCol}><Text style={styles.header}>Team Size</Text></View>
              <View style={styles.tableCol}><Text style={styles.header}>Projects</Text></View>
            </View>

            {departmentStats.map((dept, i) => {
              const lead = teamMembers.find(member => member.id === dept.leadId);
              return (
                <View key={i} style={styles.tableRow}>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{dept.name}</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{lead ? lead.name : 'Unassigned'}</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{dept.actualMemberCount}/{dept.memberCount}</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{dept.projectCount}</Text></View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Resource Allocation Section */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Resource Allocation</Text>
          
          {allocationData.map((allocation, i) => (
            <View key={i} style={{ marginVertical: 5 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 10 }}>{allocation.department}</Text>
                <Text style={{ fontSize: 10 }}>{allocation.allocated}% allocated</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${allocation.allocated}%` }]} />
              </View>
            </View>
          ))}
        </View>
        
        {/* Resource Requests Section */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Recent Resource Requests</Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCol}><Text style={styles.header}>Request Title</Text></View>
              <View style={styles.tableCol}><Text style={styles.header}>From</Text></View>
              <View style={styles.tableCol}><Text style={styles.header}>To</Text></View>
              <View style={styles.tableCol}><Text style={styles.header}>Status</Text></View>
            </View>

            {resourceRequests.slice(0, 5).map((request, i) => {
              const requestingDept = departments.find(d => d.id === request.requestingDepartmentId);
              const targetDept = departments.find(d => d.id === request.targetDepartmentId);
              
              return (
                <View key={i} style={styles.tableRow}>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{request.title}</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{requestingDept?.name || 'Unknown'}</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>{targetDept?.name || 'Unknown'}</Text></View>
                  <View style={styles.tableCol}>
                    <Text style={[
                      styles.badge, 
                      { 
                        backgroundColor: 
                          request.status === 'Approved' ? '#DCFCE7' : 
                          request.status === 'Declined' ? '#FEE2E2' : 
                          '#FEF9C3',
                        color: 
                          request.status === 'Approved' ? '#166534' : 
                          request.status === 'Declined' ? '#991B1B' : 
                          '#854D0E'
                      }
                    ]}>
                      {request.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        
        <Text style={styles.footer}>Generated by Resource Management System • Page 1</Text>
      </Page>
    </Document>
  );
};

// Components for different ways to render the PDF
export const PDFViewer_Component = ({
  teamMembers,
  departments,
  projects,
  resourceRequests,
  allocationData
}: {
  teamMembers: TeamMember[];
  departments: Department[];
  projects: Project[];
  resourceRequests: ResourceRequest[];
  allocationData: AllocationData[];
}) => (
  <PDFViewer style={{ width: '100%', height: '80vh' }}>
    <GeneralReportPDF 
      teamMembers={teamMembers}
      departments={departments}
      projects={projects}
      resourceRequests={resourceRequests}
      allocationData={allocationData}
    />
  </PDFViewer>
);

export const PDFDownloadButton = ({
  teamMembers,
  departments,
  projects,
  resourceRequests,
  allocationData
}: {
  teamMembers: TeamMember[];
  departments: Department[];
  projects: Project[];
  resourceRequests: ResourceRequest[];
  allocationData: AllocationData[];
}) => (
  <PDFDownloadLink 
    document={
      <GeneralReportPDF 
        teamMembers={teamMembers}
        departments={departments}
        projects={projects}
        resourceRequests={resourceRequests}
        allocationData={allocationData}
      />
    } 
    fileName="general-report.pdf"
  >
    {({ loading }) => 
      loading ? 'Generating PDF...' : 'Download PDF'
    }
  </PDFDownloadLink>
);
