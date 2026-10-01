import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CONTAINER_NAME = 'kali-shield-testing';

export async function executeInKali(command: string): Promise<string> {
  try {
    const dockerCmd = `docker exec ${CONTAINER_NAME} bash -c "${command.replace(/"/g, '\\"')}"`;
    const { stdout, stderr } = await execAsync(dockerCmd, { maxBuffer: 10 * 1024 * 1024, timeout: 60000 });

    if (stderr && !stderr.includes('npm warn')) {
      console.error('Docker stderr:', stderr);
    }

    return stdout || '(No output)';
  } catch (err: any) {
    if (err.message.includes('No such container')) {
      throw new Error(`Kali container '${CONTAINER_NAME}' not found. Start it with Docker first.`);
    }
    if (err.killed) {
      throw new Error('Command execution timeout (60s)');
    }
    throw new Error(`Kali execution failed: ${err.message}`);
  }
}

export async function checkKaliHealth(): Promise<boolean> {
  try {
    await execAsync(`docker inspect ${CONTAINER_NAME}`);
    return true;
  } catch {
    return false;
  }
}
