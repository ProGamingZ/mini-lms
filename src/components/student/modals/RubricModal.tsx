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
              <td>Meets all minimum counts for procedural...</td>
              <td>Missing 1-2 minor requirements...</td>
              <td>Missing several requirements...</td>
              <td>Fails to meet most requirements...</td>
            </tr>
            {/* Note: Paste the rest of your exact <tr> rows from your rubric here! */}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}