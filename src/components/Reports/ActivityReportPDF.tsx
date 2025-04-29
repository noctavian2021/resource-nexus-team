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
import { Download, Mail } from "lucide-react";
import { Activity } from '@/data/mockData';
import { format } from 'date-fns';

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
  text: {
    fontSize: 10,
    marginBottom: 5,
  },
  activityItem: {
    marginBottom: 10,
    paddingBottom: 5,
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
  absenceNote: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 5,
    color: '#666666',
  },
});

// Create Document Component
const ActivityReportDocument = ({ 
  activities,
  teamMembers,
  reportDate = new Date(),
}: { 
  activities: Activity[],
  teamMembers: any[],
  reportDate?: Date,
}) => {
  const currentDate = reportDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Group activities by type for easy reporting
  const absenceActivities = activities.filter(a => 
    a.type === 'absence_start' || a.type === 'absence_end'
  );
  
  const otherActivities = activities.filter(a => 
    a.type !== 'absence_start' && a.type !== 'absence_end'
  );
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header and Overview */}
        <View style={styles.section}>
          <Text style={styles.header}>Activity Report</Text>
          <Text style={styles.text}>Generated on: {currentDate}</Text>
        </View>
        
        {/* Absences Section */}
        {absenceActivities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Team Member Absences</Text>
            
            {absenceActivities.map((activity, i) => {
              const member = teamMembers.find(m => m.id === activity.userId);
              return (
                <View key={i} style={styles.activityItem}>
                  <Text style={styles.text}>
                    {format(new Date(activity.timestamp), 'MMM d, yyyy • h:mm a')}
                  </Text>
                  <Text style={styles.text}>
                    {activity.description}
                  </Text>
                  {member && (
                    <Text style={styles.text}>
                      User: {member.name} ({member.role})
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
        
        {/* Other Activities Section */}
        <View style={styles.section}>
          <Text style={styles.subheader}>Recent Activities</Text>
          
          {otherActivities.length > 0 ? (
            otherActivities.map((activity, i) => {
              const member = teamMembers.find(m => m.id === activity.userId);
              return (
                <View key={i} style={styles.activityItem}>
                  <Text style={styles.text}>
                    {format(new Date(activity.timestamp), 'MMM d, yyyy • h:mm a')}
                  </Text>
                  <Text style={styles.text}>
                    {activity.description}
                  </Text>
                  {member && (
                    <Text style={styles.text}>
                      User: {member.name} ({member.role})
                    </Text>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.text}>No activities to display</Text>
          )}
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>This report was automatically generated. For questions, contact the HR department.</Text>
          <Text>Daily report sent at 7:00 AM to department leads.</Text>
        </View>
      </Page>
    </Document>
  );
};

// PDF Viewer Component
export const ActivityReportViewer = ({ 
  activities,
  teamMembers,
}: { 
  activities: Activity[],
  teamMembers: any[],
}) => {
  return (
    <PDFViewer width="100%" height="100%" className="rounded-md">
      <ActivityReportDocument 
        activities={activities}
        teamMembers={teamMembers}
      />
    </PDFViewer>
  );
};

// PDF Download Button
export const ActivityReportDownloadButton = ({ 
  activities,
  teamMembers,
}: { 
  activities: Activity[],
  teamMembers: any[],
}) => {
  return (
    <BlobProvider document={<ActivityReportDocument activities={activities} teamMembers={teamMembers} />}>
      {({ url, loading }) => (
        <Button variant="secondary" disabled={loading}>
          <a 
            href={url as string} 
            download="activity-report.pdf" 
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

export default ActivityReportDownloadButton;
