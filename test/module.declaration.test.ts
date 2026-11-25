import tmp from 'tmp-promise'
import simpleGit from 'simple-git'
import { writeFile } from 'fs/promises'
import path from 'path'
import { ModuleDeclaration } from '../lib/ModuleDeclaration'
import { expect } from '@jest/globals'

jest.setTimeout(30000)

describe('ModuleDeclaration.fromText', () => {
  let tmpDir: tmp.DirectoryResult

  beforeEach(async () => {
    tmpDir = await tmp.dir({ unsafeCleanup: true })
    const git = simpleGit(tmpDir.path, {
      config: ['user.email=test@test.com', 'user.name=Tester', 'init.defaultBranch=main'],
    })
    await git.init()
    await writeFile(
      path.join(tmpDir.path, 'metadata.json'),
      '{"name":"test-tagged","version":"0.1.0","dependencies":[]}'
    )
    await git.add(path.join(tmpDir.path, 'metadata.json'))
    await git.commit('tagged release')
    await git.addTag('v1.0.0')
  })

  afterEach(async () => {
    await tmpDir.cleanup()
  })

  it('accepts :tag as an alias for :ref on a git-sourced module', async () => {
    const declaration = await new ModuleDeclaration().fromText(
      `mod 'test-tagged', :git => '${tmpDir.path}', :tag => 'v1.0.0'`
    )
    expect(declaration.ref).toEqual('v1.0.0')
  })
})
