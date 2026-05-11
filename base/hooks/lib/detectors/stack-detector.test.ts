import { detectBackendStack, getBackendInstructionMarker } from './stack-detector';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('stack-detector', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create unique temp directory for each test
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    tempDir = join(tmpdir(), `stack-test-${timestamp}-${random}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('detectBackendStack', () => {
    test('detects NestJS backend', () => {
      const content = `
# Project Knowledge

## Tech Stack

- **Backend**: nestjs
- **Frontend**: react
- **Database**: PostgreSQL
`;
      const knowledgePath = join(tempDir, '.project', 'docs');
      mkdirSync(knowledgePath, { recursive: true });
      writeFileSync(join(knowledgePath, 'PROJECT_KNOWLEDGE.md'), content);

      const result = detectBackendStack(tempDir);
      expect(result.backend).toBe('nestjs');
      expect(result.hasProject).toBe(true);
      expect(result.frontends).toContain('react');
    });

    test('detects Django backend', () => {
      const content = `
## Tech Stack

- **Backend**: django
- **Frontend**: react-native
`;
      const knowledgePath = join(tempDir, '.project', 'docs');
      mkdirSync(knowledgePath, { recursive: true });
      writeFileSync(join(knowledgePath, 'PROJECT_KNOWLEDGE.md'), content);

      const result = detectBackendStack(tempDir);
      expect(result.backend).toBe('django');
      expect(result.hasProject).toBe(true);
      expect(result.frontends).toContain('react-native');
    });

    test('detects NestJS with uppercase', () => {
      const content = `
- **Backend**: NestJS
`;
      const knowledgePath = join(tempDir, '.project', 'docs');
      mkdirSync(knowledgePath, { recursive: true });
      writeFileSync(join(knowledgePath, 'PROJECT_KNOWLEDGE.md'), content);

      const result = detectBackendStack(tempDir);
      expect(result.backend).toBe('nestjs'); // Should normalize to lowercase
    });

    test('detects multiple frontends', () => {
      const content = `
## Tech Stack

- **Backend**: nestjs
- **Frontend**: react, react-native
`;
      const knowledgePath = join(tempDir, '.project', 'docs');
      mkdirSync(knowledgePath, { recursive: true });
      writeFileSync(join(knowledgePath, 'PROJECT_KNOWLEDGE.md'), content);

      const result = detectBackendStack(tempDir);
      expect(result.frontends).toHaveLength(2);
      expect(result.frontends).toContain('react');
      expect(result.frontends).toContain('react-native');
    });

    test('handles missing PROJECT_KNOWLEDGE.md', () => {
      const result = detectBackendStack(tempDir);
      expect(result.backend).toBe(null);
      expect(result.hasProject).toBe(false);
      expect(result.frontends).toEqual([]);
    });

    test('handles PROJECT_KNOWLEDGE.md without backend field', () => {
      const content = `
# Project Knowledge

## Overview
This is a project without tech stack defined.

## Features
- Feature 1
- Feature 2
`;
      const knowledgePath = join(tempDir, '.project', 'docs');
      mkdirSync(knowledgePath, { recursive: true });
      writeFileSync(join(knowledgePath, 'PROJECT_KNOWLEDGE.md'), content);

      const result = detectBackendStack(tempDir);
      expect(result.backend).toBe(null);
      expect(result.hasProject).toBe(true); // File exists
      expect(result.frontends).toEqual([]);
    });

    test('handles invalid backend value', () => {
      const content = `
## Tech Stack

- **Backend**: express
- **Frontend**: react
`;
      const knowledgePath = join(tempDir, '.project', 'docs');
      mkdirSync(knowledgePath, { recursive: true });
      writeFileSync(join(knowledgePath, 'PROJECT_KNOWLEDGE.md'), content);

      const result = detectBackendStack(tempDir);
      expect(result.backend).toBe(null); // 'express' not in allowed values
      expect(result.hasProject).toBe(true);
    });

    test('handles malformed file gracefully', () => {
      const content = `
This is not a valid markdown file
Random content
`;
      const knowledgePath = join(tempDir, '.project', 'docs');
      mkdirSync(knowledgePath, { recursive: true });
      writeFileSync(join(knowledgePath, 'PROJECT_KNOWLEDGE.md'), content);

      const result = detectBackendStack(tempDir);
      expect(result.backend).toBe(null);
      expect(result.hasProject).toBe(true);
      // Should not throw error
    });

    test('handles empty PROJECT_KNOWLEDGE.md', () => {
      const content = ``;
      const knowledgePath = join(tempDir, '.project', 'docs');
      mkdirSync(knowledgePath, { recursive: true });
      writeFileSync(join(knowledgePath, 'PROJECT_KNOWLEDGE.md'), content);

      const result = detectBackendStack(tempDir);
      expect(result.backend).toBe(null);
      expect(result.hasProject).toBe(true);
    });

    test('handles backend with extra whitespace', () => {
      const content = `
- **Backend**:    nestjs
`;
      const knowledgePath = join(tempDir, '.project', 'docs');
      mkdirSync(knowledgePath, { recursive: true });
      writeFileSync(join(knowledgePath, 'PROJECT_KNOWLEDGE.md'), content);

      const result = detectBackendStack(tempDir);
      expect(result.backend).toBe('nestjs');
    });

    test('ignores backend in middle of line', () => {
      const content = `
Some text - **Backend**: nestjs in the middle

- **Backend**: django
`;
      const knowledgePath = join(tempDir, '.project', 'docs');
      mkdirSync(knowledgePath, { recursive: true });
      writeFileSync(join(knowledgePath, 'PROJECT_KNOWLEDGE.md'), content);

      const result = detectBackendStack(tempDir);
      expect(result.backend).toBe('django'); // Should match line that starts with -
    });
  });

  describe('getBackendInstructionMarker', () => {
    test('returns NESTJS_INSTRUCTIONS for nestjs', () => {
      const marker = getBackendInstructionMarker('nestjs');
      expect(marker).toBe('NESTJS_INSTRUCTIONS');
    });

    test('returns DJANGO_INSTRUCTIONS for django', () => {
      const marker = getBackendInstructionMarker('django');
      expect(marker).toBe('DJANGO_INSTRUCTIONS');
    });

    test('returns STACK_NOT_DETECTED for null', () => {
      const marker = getBackendInstructionMarker(null);
      expect(marker).toBe('STACK_NOT_DETECTED');
    });
  });
});
