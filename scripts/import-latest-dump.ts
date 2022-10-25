import * as dotenv from 'dotenv'
dotenv.config({ path: './.env.local' })
import fs from 'fs'
import https from 'https'
import cp from 'child_process'
import readline from 'readline'

// fetch latest dump from nos deputes
// import it locally (will drop/recreate the local database !)

const LATEST_DUMP =
  'https://data.regardscitoyens.org/nosdeputes.fr/nosdeputes.fr_donnees.sql.gz'
const DUMP_PREVIOUS_LEGISLATURE =
  'https://data.regardscitoyens.org/nosdeputes.fr/nosdeputes.fr_2017_2022_donnees.sql.gz'

const dumpToUse = LATEST_DUMP
const dbName = process.env.DB_NAME
// const dbName = 'nosdeputes'

function downloadFile(url: string, destination: string) {
  return new Promise<void>((resolve, reject) => {
    var file = fs.createWriteStream(destination)
    console.log(`> Downloading ${url} to ${destination}`)
    https.get(url, function (response) {
      response.pipe(file)
      file.on('finish', function () {
        file.close(err => {
          if (err) reject(err)
          else resolve()
        })
      })
    })
  })
}

function deleteIfExists(file: string): void {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
  }
}

var zlib = require('zlib')

function gunzipFile(source: string, destination: string) {
  console.log(`> Unzipping ${source} to ${destination}`)
  return new Promise((resolve, reject) => {
    try {
      var src = fs.createReadStream(source)
      var dest = fs.createWriteStream(destination)
      src.pipe(zlib.createGunzip()).pipe(dest)
      dest.on('close', resolve)
    } catch (err) {
      reject(err)
    }
  })
}

function runCommand(command: string) {
  console.log('> Running command', command)
  cp.execSync(command, { stdio: 'inherit' })
}

function promptUserYes() {
  return new Promise<boolean>((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question('Are you sure (yes) ?', function (answer) {
      resolve(answer === 'yes')
      rl.close()
    })
  })
}

async function start() {
  console.log(
    'This script will execute a bunch of MYSQL commands, including dropping a database with sudo',
  )
  if (await promptUserYes()) {
    console.log(
      'This next command uses sudo, you will be asked your sudo password',
    )
    runCommand(`sudo mysql -u root -e 'SHOW DATABASES;'`)
    runCommand(
      `sudo mysql -u root -e 'DROP DATABASE IF EXISTS ${process.env.DB_NAME};'`,
    )
    runCommand(`sudo mysql -u root -e 'CREATE DATABASE ${dbName};'`)
    runCommand(`sudo mysql -u root -e 'SHOW DATABASES;'`)
    const dumpURL = dumpToUse
    const downloadedFile = './scripts/tmp/dump.sql.gz'
    const unzippedFile = './scripts/tmp/dump.sql'
    deleteIfExists(downloadedFile)
    deleteIfExists(unzippedFile)
    await downloadFile(dumpURL, downloadedFile)
    await gunzipFile(downloadedFile, unzippedFile)
    console.log(
      'These next commands use the regular user, the one from your .env.local file. You will be asked its password',
    )
    runCommand(`mysql -u ${process.env.DB_USER} -p ${dbName} < ${unzippedFile}`)
    runCommand(
      `mysql -u ${process.env.DB_USER} -p ${dbName} -e 'SELECT COUNT(*) FROM parlementaire;'`,
    )
    console.log(
      'If you see a nice number of parlementaire above (not 0) then the import was probably successful',
    )
  }
}

start()
