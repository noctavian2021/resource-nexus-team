
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer,
  BlobProvider
} from '@react-pdf/renderer';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TeamMember, Department, Project, resourceRequests } from '@/data/mockData';

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
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    borderTopStyle: 'solid',
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
  orgItem: {
    marginLeft: 20,
    marginBottom: 5,
  },
  directorItem: {
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    borderBottomStyle: 'solid',
  },
  departmentItem: {
    marginLeft: 20,
    marginBottom: 15,
  },
  leadItem: {
    marginLeft: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  memberItem: {
    marginLeft: 40,
    marginBottom: 5,
  },
  projectItem: {
    marginBottom: 5,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
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
const OrgMapDocument = ({ 
  teamMembers, 
  departments, 
  projects 
}: { 
  teamMembers: TeamMember[], 
  departments: Department[], 
  projects: Project[] 
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Find directors
  const directors = teamMembers.filter(member => member.role === 'Director');
  
  // Get active projects
  const activeProjects = projects.filter(project => project.status === 'Active');
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header and Overview */}
        <View style={styles.section}>
          <Text style={styles.header}>Organization Map</Text>
          <Text style={styles.text}>Generated on: {currentDate}</Text>
          
          <View style={{ marginTop: 20 }}>
            <Text style={styles.subheader}>Organization Structure</Text>
          </View>
        </View>
        
        {/* Directors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Directors</Text>
          {directors.length > 0 ? (
            directors.map((director, i) => (
              <View key={i} style={styles.directorItem}>
                <Text style={styles.boldText}>{director.name} - Director</Text>
                <Text style={styles.text}>Email: {director.email}</Text>
                {director.skills && director.skills.length > 0 && (
                  <Text style={styles.text}>Skills: {director.skills.join(', ')}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.text}>No directors assigned</Text>
          )}
        </View>
        
        {/* Departments and Teams Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Departments</Text>
          
          {departments.map((department, i) => {
            const lead = teamMembers.find(m => m.id === department.leadId);
            const deptMembers = teamMembers.filter(
              m => m.department === department.name && (!lead || m.id !== lead.id)
            );
            
            return (
              <View key={i} style={styles.departmentItem}>
                <Text style={styles.boldText}>{department.name}</Text>
                <Text style={styles.text}>{department.description}</Text>
                
                {lead ? (
                  <View style={styles.leadItem}>
                    <Text style={styles.boldText}>Department Lead: {lead.name}</Text>
                    <Text style={styles.text}>Email: {lead.email}</Text>
                    <Text style={styles.text}>Role: {lead.role}</Text>
                  </View>
                ) : (
                  <Text style={styles.text}>No department lead assigned</Text>
                )}
                
                {deptMembers.length > 0 ? (
                  <View>
                    <Text style={styles.boldText}>Team Members:</Text>
                    {deptMembers.map((member, j) => (
                      <View key={j} style={styles.memberItem}>
                        <Text style={styles.text}>
                          {member.name} - {member.role}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.text, styles.memberItem]}>No additional team members</Text>
                )}
              </View>
            );
          })}
        </View>
        
        {/* Active Projects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Projects</Text>
          
          {activeProjects.length > 0 ? (
            activeProjects.map((project, i) => {
              const dept = departments.find(d => d.id === project.departmentId);
              const projectMembers = project.teamMembers.map(
                memberId => teamMembers.find(m => m.id === memberId)?.name
              ).filter(Boolean);
              
              return (
                <View key={i} style={styles.projectItem}>
                  <Text style={styles.boldText}>{project.name}</Text>
                  <Text style={styles.text}>Department: {dept?.name || 'Unassigned'}</Text>
                  <Text style={styles.text}>Description: {project.description}</Text>
                  <Text style={styles.text}>
                    Team: {projectMembers.length > 0 ? projectMembers.join(', ') : 'No team members assigned'}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.text}>No active projects</Text>
          )}
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>This report was automatically generated. For questions, contact the HR department.</Text>
        </View>
      </Page>
    </Document>
  );
};

// PDF Viewer Component
export const PDFViewer_Component = ({ 
  teamMembers, 
  departments, 
  projects, 
  resourceRequests, 
  allocationData 
}: { 
  teamMembers: TeamMember[], 
  departments: Department[], 
  projects: Project[], 
  resourceRequests: any[],
  allocationData: any[]
}) => {
  return (
    <PDFViewer width="100%" height="100%" className="rounded-md">
      <OrgMapDocument 
        teamMembers={teamMembers}
        departments={departments}
        projects={projects}
      />
    </PDFViewer>
  );
};

// PDF Download Button with correct implementation
export const PDFDownloadButton = ({ 
  teamMembers, 
  departments, 
  projects 
}: { 
  teamMembers: TeamMember[], 
  departments: Department[], 
  projects: Project[], 
  resourceRequests: any[],
  allocationData: any[]
}) => {
  return (
    <BlobProvider document={<OrgMapDocument teamMembers={teamMembers} departments={departments} projects={projects} />}>
      {({ url, loading }) => (
        <Button variant="secondary" disabled={loading}>
          <a 
            href={url as string} 
            download="organization-map.pdf" 
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Generating PDF..." : "Download PDF"}
          </a>
        </Button>
      )}
    </BlobProvider>
  );
};

// Default export component
const PDFReport = () => {
  return (
    <BlobProvider document={<OrgMapDocument teamMembers={[]} departments={[]} projects={[]} />}>
      {({ url, loading }) => (
        <Button 
          variant="secondary"
          disabled={loading}
          asChild
        >
          <a href={url as string} download="organization-map.pdf" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Generating PDF..." : "Download PDF"}
          </a>
        </Button>
      )}
    </BlobProvider>
  );
};

export default PDFReport;
