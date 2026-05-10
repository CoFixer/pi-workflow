#!/usr/bin/env node
/**
 * Google Sheets Helper for Weekly Activity Reports
 *
 * Spreadsheet Structure:
 * - Each team member has their own sheet (tab)
 * - Columns: Name, Week, Date, Grade, Commits, Communication Points, Total
 *
 * Usage:
 *   node sheets-helper.js test
 *   node sheets-helper.js write-weekly '[{"name":"Siam","week":"Jan W3","grade":"A+","commits":63,"commPts":25,"total":70},...]'
 *   node sheets-helper.js read Lukas
 */

const { google } = require('googleapis');
const path = require('path');

// Configuration
const SPREADSHEET_ID = '1ru88-pKjJ8NbdG6uBAWpo7SAfWUagc6gq-92pRcK0tU';
const CREDENTIALS_PATH = path.join(__dirname, '../config/google-service-account.json');

// Map Slack/GitHub names to sheet names
const NAME_TO_SHEET = {
  'Lukas': 'Lukas',
  '신동섭': 'Lukas',
  'DongsubShin': 'Lukas',
  'Siam Maruf': 'Siam',
  'Md Siam Maruf': 'Siam',
  'Jayden': 'Jayden',
  'PotentialJayden': 'Jayden',
  'GM Zulkar Nine': 'Zulkar',
  'Zulkar': 'Zulkar',
  'Hasan Al Mahmud': 'Mahmud',
  'Mahmud': 'Mahmud',
  'Rifat': 'Rifat',
  'Saiful Islam': 'Saiful',
  'Saiful': 'Saiful',
  'Abdul Karim Shamim': 'shamim',
  'shamim': 'shamim',
  'Abdullah Al Nomaan': 'Nomaan',
  'Nomaan': 'Nomaan',
  'Atik': 'Atik',
  'Abdur Rahman': 'Abdur',
  'Abdur': 'Abdur',
  'Symon': 'Symon',
  'talha': 'talha',
  'talha4t': 'talha',
  'Meherab': 'Meherab',
  'MD HOSSEN RANA': 'Rana',
  'Rana': 'Rana',
  'Yasin': 'Yasin',
  'Al Fazle Shifat': 'Shifat',
  'Shifat': 'Shifat',
  'Mohibullah': 'Mohibullah',
  'Riaz': 'Riaz',
  'Eddy': 'Eddy',
  'Rahid Uddin Ahmed': 'Rahid',
  'Rahid': 'Rahid',
  'Md Rumon Sarker': 'Rumon',
  'Rumon': 'Rumon',
  'Foysal': 'Foysal',
  'Muksitur Rahman Rafi': 'Rafi',
  'Rafi': 'Rafi',
  'Redwanul': 'Redwanul',
  'Rukaiya': 'Rukaiya',
  'Tasfia': 'Tasfia',
  'MD Ahosan Habib': 'Habib',
  'Habib': 'Habib',
  'Zihad Hossion': 'Zihad',
  'Zihad': 'Zihad',
  'Ashadul Mridha': 'Ashadul',
  'Ashadul': 'Ashadul',
};

function getSheetName(name) {
  return NAME_TO_SHEET[name] || name;
}

function getWeekLabel(date = new Date()) {
  const d = new Date(date);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const weekOfMonth = Math.ceil(d.getDate() / 7);
  return `${month} W${weekOfMonth}`;
}

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

async function appendToPersonSheet(authClient, sheets, data) {
  const sheetName = getSheetName(data.name);
  const week = data.week || getWeekLabel();
  const date = data.date || new Date().toISOString().split('T')[0];

  // Row format: Name, Week, Date, Grade, Commits, Communication Points, Total
  const row = [
    data.name,
    week,
    date,
    data.grade,
    data.commits,
    data.commPts,
    data.total
  ];

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A:G`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [row] },
    });
    return { success: true, name: data.name, sheet: sheetName };
  } catch (error) {
    console.error(`Failed to write to ${sheetName}:`, error.message);
    return { success: false, name: data.name, sheet: sheetName, error: error.message };
  }
}

async function writeWeeklyReport(dataArray) {
  const authClient = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const results = [];
  for (const data of dataArray) {
    const result = await appendToPersonSheet(authClient, sheets, data);
    results.push(result);
  }

  return results;
}

async function readPersonSheet(name) {
  const authClient = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const sheetName = getSheetName(name);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!A:G`,
  });

  return response.data.values;
}

async function testConnection() {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    console.log('Connection successful!');
    console.log('Spreadsheet:', response.data.properties.title);
    console.log('Sheets:', response.data.sheets.map(s => s.properties.title).join(', '));
    return true;
  } catch (error) {
    console.error('Connection failed:', error.message);
    return false;
  }
}

async function listSheets() {
  const authClient = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  return response.data.sheets.map(s => s.properties.title);
}

// CLI Handler
async function main() {
  const [,, command, ...args] = process.argv;

  try {
    switch (command) {
      case 'test':
        await testConnection();
        break;

      case 'write-weekly':
        if (args[0]) {
          const data = JSON.parse(args[0]);
          const dataArray = Array.isArray(data) ? data : [data];
          const results = await writeWeeklyReport(dataArray);

          const success = results.filter(r => r.success).length;
          const failed = results.filter(r => !r.success).length;

          console.log(`Written: ${success} rows, Failed: ${failed} rows`);
          if (failed > 0) {
            console.log('Failed:', results.filter(r => !r.success).map(r => `${r.name}: ${r.error}`).join(', '));
          }
        } else {
          console.error('Usage: node sheets-helper.js write-weekly \'[{"name":"...","grade":"...","commits":0,"commPts":0,"total":0},...]\'');
        }
        break;

      case 'read':
        if (args[0]) {
          const data = await readPersonSheet(args[0]);
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.error('Usage: node sheets-helper.js read <name>');
        }
        break;

      case 'list-sheets':
        const sheets = await listSheets();
        console.log('Available sheets:', sheets.join(', '));
        break;

      case 'week-label':
        console.log('Current week:', getWeekLabel());
        break;

      default:
        console.log('Google Sheets Helper - Weekly Activity Reports\n');
        console.log('Commands:');
        console.log('  test          - Test connection to Google Sheets');
        console.log('  write-weekly  - Write weekly report data for all members');
        console.log('  read <name>   - Read data for a specific person');
        console.log('  list-sheets   - List all available sheets');
        console.log('  week-label    - Show current week label (e.g., "Jan W3")');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
