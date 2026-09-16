import Modal from '../../common/Modal';

interface RubricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RubricModal({ isOpen, onClose }: RubricModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lab Activity Rubric" maxWidth="900px">
      <div className="table-responsive">
        <table className="rubric-table">
          <thead>
            <tr>
              <th>Criteria</th>
              <th>Weight</th>
              <th>Excellent (4)</th>
              <th>Good (3)</th>
              <th>Fair (2)</th>
              <th>Poor (1)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Structural Requirements</strong></td>
              <td>30%</td>
              <td>Meets all minimum counts for procedural (e.g., 3 loops, 3 arrays) or OOP elements (e.g., 4 classes, 2 object literals) as examples; code runs flawlessly</td>
              <td>Missing 1-2 minor requirements; runs with minor issues.</td>
              <td>Missing several requirements; code has noticeable bugs. </td>
              <td>Fails to meet most requirements; code does not run.</td>
            </tr>
            <tr>
              <td><strong>Concept Application & Logic</strong></td>
              <td>30%</td>
              <td>Procedural logic and OOP pillars (Encapsulation, Abstraction, Inheritance, Polymorphism) are implemented logically and accurately.</td>
              <td>Concepts are used correctly, but logic is slightly forced or inefficient.</td>
              <td>Misunderstanding of core concepts (e.g., forced inheritance that makes no logical sense).</td>
              <td>Concepts are used incorrectly or are entirely missing.</td>
            </tr>
            <tr>
              <td><strong>Syntax & Best Practices</strong></td>
              <td>15%</td>
              <td>Proper use of modern JS syntax (let/const, arrow functions); follows best practices.</td>
              <td>Minor syntax issues; mostly follows conventions</td>
              <td>Several syntax errors or inconsistent style</td>
              <td>Frequent syntax errors; poor coding conventions</td>
            </tr>
            <tr>
              <td><strong>Code Readability & Organization</strong></td>
              <td>15%</td>
              <td>Well-structured, consistent indentation, highly descriptive naming.</td>
              <td>Generally readable with minor lapses</td>
              <td>Somewhat disorganized; unclear naming</td>
              <td>Poorly organized; hard to follow</td>
            </tr>
            <tr>
              <td><strong>Comments & Documentation</strong></td>
              <td>10%</td>
              <td>Clear, helpful comments explaining the "why" behind their open-ended logic.</td>
              <td>Some comments present but incomplete</td>
              <td>Few or unclear comments</td>
              <td>No comments/documentation</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
}