const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD } = process.env

if (!NEO4J_URI) throw new Error('NEO4J_URI is not provided')
if (!NEO4J_USERNAME) throw new Error('NEO4J_USERNAME is not provided')
if (!NEO4J_PASSWORD) throw new Error('NEO4J_PASSWORD is not provided')

import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME!,
    process.env.NEO4J_PASSWORD!
  )
)

export async function read(query: string, params: any = {}) {
  const session = driver.session()
  

  try {
    const res = await session.executeRead(tx => tx.run(query, params))

    const values = res.records.map(record => record.toObject())

    return values
  }
  finally {
    session.close()
  }
}

export async function write(query: string, params: any = {}) {
  const session = driver.session()

  try {
    const res = await session.executeWrite(tx => tx.run(query, params))

    const values = res.records.map(record => record.toObject())

    return values
  }
  finally {
    session.close()
  }
}
