import { prisma } from '@/lib/prisma'
import { createStudentSchema, updateStudentSchema, studentFilterSchema } from '@/lib/validation'

export class StudentService {
  /**
   * Search students with filters
   */
  static async searchStudents(filters: {
    studentId?: string
    name?: string
    classGrade?: string
    activeStatus?: string
  }) {
    try {
      const validatedFilters = studentFilterSchema.parse(filters)

      const where: any = {}

      if (validatedFilters.studentId) {
        where.studentId = { contains: validatedFilters.studentId, mode: 'insensitive' }
      }

      if (validatedFilters.name) {
        where.name = { contains: validatedFilters.name, mode: 'insensitive' }
      }

      if (validatedFilters.classGrade) {
        where.classGrade = validatedFilters.classGrade
      }

      if (validatedFilters.activeStatus) {
        where.activeStatus = validatedFilters.activeStatus === 'true'
      }

      const students = await prisma.student.findMany({
        where,
        select: {
          id: true,
          studentId: true,
          name: true,
          classGrade: true,
          activeStatus: true,
          contactInfo: true,
        },
        orderBy: { name: 'asc' },
      })

      return students
    } catch (error: any) {
      console.error('Search students error:', error)
      throw new Error('Failed to search students')
    }
  }

  /**
   * Get student by ID
   */
  static async getStudentById(id: string) {
    try {
      const student = await prisma.student.findUnique({
        where: { id },
        select: {
          id: true,
          studentId: true,
          name: true,
          classGrade: true,
          activeStatus: true,
          contactInfo: true,
        },
      })

      return student
    } catch (error: any) {
      console.error('Get student error:', error)
      throw new Error('Failed to get student')
    }
  }

  /**
   * Get student case history
   */
  static async getStudentCaseHistory(studentId: string) {
    try {
      const cases = await prisma.case.findMany({
        where: { studentId },
        select: {
          id: true,
          referenceNumber: true,
          incidentDate: true,
          category: true,
          status: true,
          submittedAt: true,
          reporter: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      })

      return cases
    } catch (error: any) {
      console.error('Get student case history error:', error)
      throw new Error('Failed to get student case history')
    }
  }

  /**
   * Create a new student
   */
  static async createStudent(data: {
    studentId: string
    name: string
    classGrade: string
    activeStatus?: boolean
    contactInfo?: string
  }) {
    try {
      const validatedData = createStudentSchema.parse(data)

      // Check if student ID already exists
      const existingStudent = await prisma.student.findUnique({
        where: { studentId: validatedData.studentId },
      })

      if (existingStudent) {
        throw new Error('Student with this ID already exists')
      }

      const student = await prisma.student.create({
        data: validatedData,
        select: {
          id: true,
          studentId: true,
          name: true,
          classGrade: true,
          activeStatus: true,
          contactInfo: true,
        },
      })

      return student
    } catch (error: any) {
      console.error('Create student error:', error)
      throw new Error(error.message || 'Failed to create student')
    }
  }

  /**
   * Update student
   */
  static async updateStudent(id: string, data: {
    name?: string
    classGrade?: string
    activeStatus?: boolean
    contactInfo?: string
  }) {
    try {
      const validatedData = updateStudentSchema.parse(data)

      const student = await prisma.student.update({
        where: { id },
        data: validatedData,
        select: {
          id: true,
          studentId: true,
          name: true,
          classGrade: true,
          activeStatus: true,
          contactInfo: true,
        },
      })

      return student
    } catch (error: any) {
      console.error('Update student error:', error)
      throw new Error('Failed to update student')
    }
  }
}
